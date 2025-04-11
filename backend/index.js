#!/usr/bin/env node
'use strict';

const path = require('path')
const express = require("express");
const cors = require('cors');
const multer = require('multer')
const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // this is the Vite dev server
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const JWT_SECRET = 'some_secret_string';

/**
 * POST /auth/tokens
 */
app.post('/auth/tokens', async (req, res) => {
    try {
        const { utorid, password } = req.body;
        if (!utorid || !password) {
            return res.status(400).json({ error: 'Missing utorid or password.' });
        }

        const user = await prisma.user.findUnique({
            where: { utorid },
        });

        if (!user || !user.password) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        const passwordMatches = await bcrypt.compare(password, user.password);
        
        if (!passwordMatches) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }

        await prisma.user.update({
            where: { utorid },
            data: { lastLogin: new Date() }
        });

        const token = jwt.sign(
            { id: user.id, role: user.role, utorid: user.utorid },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
    } catch (err) {
        console.error('Error logging in:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized - Invalid token." });
    }
};


const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized - No token provided." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden - Insufficient privileges." });
        }

        next();
    };
};


/**
 * POST /users
 */
app.post('/users', authenticate, authorize(["cashier", "manager", "superuser"]), async (req, res) => {
    try {
        const { utorid, name, email } = req.body;
        if (!utorid || !name || !email) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        if (!/^[a-zA-Z0-9]{8}$/.test(utorid)) {
            return res.status(400).json({ error: "Utorid must be exactly 8 alphanumeric characters." });
        }

        if (!/^[a-zA-Z0-9._%+-]+@mail.utoronto.ca$/.test(email)) {
            return res.status(400).json({ error: "Invalid University of Toronto email." });
        }

        if (name.length < 1 || name.length > 50) {
            return res.status(400).json({ error: "Name must be between 1 and 50 characters." });
        }

        const existingUser = await prisma.user.findUnique({ where: { utorid } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists." });
        }

        const resetToken = uuidv4();
        const resetTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const newUser = await prisma.user.create({
            data: {
                utorid,
                username: utorid,
                name,
                email,
                password: await bcrypt.hash("TempPass123!", 10),
                resetToken,
                resetTokenExpires,
                role: "regular",
            }
        });

        return res.status(201).json({
            id: newUser.id,
            utorid: newUser.utorid,
            name: newUser.name,
            email: newUser.email,
            verified: newUser.verified,
            expiresAt: resetTokenExpires.toISOString(),
            resetToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/users', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
        let { name, role, verified, activated, page = 1, limit = 10 } = req.query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        if (isNaN(page) || page < 1) {
            return res.status(400).json({ error: "Invalid page number." });
        }
        if (isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: "Invalid limit value." });
        }

        const verifiedBool = verified === 'true' ? true : verified === 'false' ? false : undefined;
        const activatedBool = activated === 'true' ? true : activated === 'false' ? false : undefined;

        const where = {};

        if (role) where.role = role.toLowerCase();
        if (verifiedBool !== undefined) where.verified = verifiedBool;

        if (activatedBool === true) {
            where.lastLogin = { not: null };  
        } else if (activatedBool === false) {
            where.OR = [
                { lastLogin: null }, 
                { lastLogin: { equals: null } }
            ];
        }

        if (name) {
            where.OR = [
                { utorid: { contains: name } },
                { name: { contains: name } },
            ];
        }

        const totalCount = await prisma.user.count({ where });

        const skip = Math.max(0, (page - 1) * limit);

        const users = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "asc" },
        });

        return res.json({
            count: totalCount,
            results: users.map(u => ({
                id: u.id,
                utorid: u.utorid,
                name: u.name,
                email: u.email,
                birthday: u.birthday ? u.birthday.toISOString().split("T")[0] : null,
                role: u.role.toLowerCase(),
                points: u.points,
                createdAt: u.createdAt.toISOString(),
                lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
                verified: u.verified,
                avatarUrl: u.avatarUrl,
                promotions: u.promotions,
            })),
        });

    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

  

const resetRequestTracker = {}; 

app.post('/auth/resets', async (req, res) => {
    try {
        const { utorid } = req.body;

        if (!utorid) {
            return res.status(400).json({ error: "Missing utorid." });
        }

        const now = Date.now();
        if (resetRequestTracker[utorid] && now - resetRequestTracker[utorid] < 60 * 1000) {
            return res.status(429).json({ error: "Too many requests" });
        }
        resetRequestTracker[utorid] = now;

        const user = await prisma.user.findUnique({ where: { utorid } });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const resetToken = uuidv4();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiry

        if (user) {
            await prisma.user.update({
                where: { utorid },
                data: { resetToken, resetTokenExpires }
            });
        }

        return res.status(202).json({
            expiresAt: resetTokenExpires.toISOString(),
            resetToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /auth/resets/:resetToken
 */
app.post('/auth/resets/:resetToken', async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { utorid, password } = req.body;

        if (!utorid || !password) {
            return res.status(400).json({ error: "Missing utorid or password." });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be 8-20 characters, etc" });
        }

        const user = await prisma.user.findFirst({
            where: { resetToken },
        });

        if (!user) {
            return res.status(404).json({ error: "Invalid reset token." });
        }

        if (new Date() > new Date(user.resetTokenExpires)) {
            return res.status(410).json({ error: "Reset token expired." });
        }

        if (user.utorid !== utorid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { utorid },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return res.status(200).json({ message: "Password reset successful." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploads/avatars"));
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1]; // Extract file extension
        cb(null, `${req.user.utorid}.${extension}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
});

/**
 * GET /users/me
 */
app.get('/users/me', authenticate, authorize(["regular","cashier","manager","superuser"]), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                promotions: {
                    include: {
                        promotion: true 
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        let filteredPromotions = [];
        if (user.promotions) {
            filteredPromotions = user.promotions
                .map(up => up.promotion)
                .filter(promo => promo.type === "oneTime" /* && !promo.used */);
        }

        return res.json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday ? user.birthday.toString().split("T")[0] : null,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt.toISOString(),
            lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
            verified: user.verified,
            avatarUrl: user.avatarUrl ? `/uploads/avatars/${user.utorid}.png` : null,
            promotions: filteredPromotions
        });

    } catch (err) {
        console.error("Error retrieving current user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



/**
 * PATCH /users/me
 */
app.patch("/users/me", 
    authenticate, 
    authorize(["regular","cashier","manager","superuser"]), 
    upload.single("avatar"), 
    async (req, res) => {
  try {
    const { name, email, birthday } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
        return res.status(400).json({ error: "Name must be between 1 and 50 characters." });
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@mail.utoronto.ca$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email." });
      }
      updateData.email = email;
    }

    if (birthday !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthday)) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      const parsed = new Date(birthday);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: "Invalid date provided." });
      }
      updateData.birthday = parsed; 
    }

    if (req.file) {
      updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    return res.json({
      id: updatedUser.id,
      utorid: updatedUser.utorid,
      name: updatedUser.name,
      email: updatedUser.email,
      birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split("T")[0] : null,
      role: updatedUser.role,
      points: updatedUser.points,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
      verified: updatedUser.verified,
      avatarUrl: updatedUser.avatarUrl || null
    });

  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PATCH /users/me/password
 */
app.patch('/users/me/password', authenticate, async (req, res) => {
    try {
        const { old, new: newPassword } = req.body;

        if (!old || !newPassword) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                error: "New password must be 8-20 characters, etc.."
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const isPasswordCorrect = await bcrypt.compare(old, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/users/:userId', authenticate, authorize(["cashier", "manager", "superuser"]), async (req, res) => {
  try {
      const { userId } = req.params;
      const isManagerOrHigher = ["manager", "superuser"].includes(req.user.role);

      const selectFields = isManagerOrHigher
          ? {
              id: true,
              utorid: true,
              name: true,
              email: true,
              birthday: true,
              role: true,
              points: true,
              createdAt: true,
              lastLogin: true,
              verified: true,
              avatarUrl: true,
              promotions: {
                  include: { promotion: true }
              }
          }
          : {
              id: true,
              utorid: true,
              name: true,
              points: true,
              verified: true,
              promotions: {
                  include: { promotion: true }
              }
          };

      const user = await prisma.user.findUnique({
          where: { id: parseInt(userId, 10) },
          select: selectFields
      });

      if (!user) {
          return res.status(404).json({ error: "User not found." });
      }

      const filteredPromotions = user.promotions
          .map(up => up.promotion)
          .filter(promo => promo.type === "oneTime" && !promo.used);

      const baseResponse = {
          id: user.id,
          utorid: user.utorid,
          name: user.name,
          points: user.points,
          verified: user.verified,
          promotions: filteredPromotions,
      };

      if (isManagerOrHigher) {
          return res.json({
              ...baseResponse,
              email: user.email,
              birthday: user.birthday ? user.birthday.toISOString().split("T")[0] : null,
              role: user.role.toLowerCase(),
              createdAt: user.createdAt.toISOString(),
              lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
              avatarUrl: user.avatarUrl,
          });
      }

      return res.json(baseResponse);

  } catch (err) {
      console.error("Error retrieving user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
  }
});


// Used for transferring points in the frontend
app.get('/users/utorid/:utorid', authenticate, async (req, res) => {
  const { utorid } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { utorid }
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({
      id: user.id,
      name: user.name,
      utorid: user.utorid
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})


/**
 * PATCH /users/:userId
 */
app.patch('/users/:userId', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID format." });
        }

        const { email, verified, suspicious, role } = req.body;

        if (verified === "true") verified = true;
        if (verified === "false") verified = false;
        if (suspicious === "true") suspicious = true;
        if (suspicious === "false") suspicious = false;
    
        if (!email && verified === undefined && suspicious === undefined && !role) {
          return res.status(400).json({ error: "No valid fields to update." });
        }
        
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId, 10) }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const updateData = {};

        if (email) {
            if (!/^[a-zA-Z0-9._%+-]+@mail.utoronto.ca$/.test(email)) {
                return res.status(400).json({ error: "Invalid University of Toronto email." });
            }
            updateData.email = email;
        }

        if (verified !== undefined) {
            if (verified !== true) {
                return res.status(400).json({ error: "Verified field must always be set to true." });
            }
            updateData.verified = true;
        }

        if (req.body.hasOwnProperty("suspicious")) {
            if (suspicious !== null && typeof suspicious !== "boolean") {
                return res.status(400).json({ error: "Suspicious must be a boolean value or null." });
            }
        
            if (suspicious !== null) {
                updateData.suspicious = suspicious;
            }
        }        

        if (role) {
            const allowedRolesForManagers = ["cashier", "regular"];
            const allowedRolesForSuperusers = ["regular", "cashier", "manager", "superuser"];

            if (req.user.role === "manager" && !allowedRolesForManagers.includes(role.toLowerCase())) {
                return res.status(403).json({ error: "Managers can only set role to 'cashier' or 'regular'." });
            }
            if (req.user.role === "superuser" && !allowedRolesForSuperusers.includes(role.toLowerCase())) {
                return res.status(403).json({ error: "Invalid role for Superuser." });
            }

            updateData.role = role.toLowerCase();

            if (role.toLowerCase() === "cashier") {
                updateData.suspicious = false;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return res.json({
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
            ...updateData, 
        });

    } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * POST /users/me/transactions - redemption transaction
 */

app.post('/users/me/transactions', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { type, amount, remark } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: "Transaction type cannot be empty." });
    }

    if (type !== "redemption") {
      return res.status(400).json({ error: "Only 'redemption' transactions are allowed on this route." });
    }

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: "Amount must be a number and cannot be empty." });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive value." });
    }

    if (remark && typeof remark !== 'string') {
      return res.status(400).json({ error: "Remark must be a string." });
    }

    if (user.points < amount) {
      return res.status(400).json({ error: `Insufficient point balance for ${amount} redemption.` });
    }

    const redemptionTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'redemption',
        amount,
        createdById: user.id,
        remark: remark || '',
        processed: false // Add default processed flag if needed
      }
    });

    if (!redemptionTx) {
      return res.status(500).json({ error: "Redemption could not be processed due to internal error." });
    }

    return res.status(201).json({
      id: redemptionTx.id,
      utorid: user.utorid,
      type: 'redemption',
      processedBy: null,
      amount,
      remark: redemptionTx.remark,
      createdBy: user.utorid
    });

  } catch (err) {
    console.error("Error processing redemption transaction:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/users/me/transactions', authenticate,  async (req, res) => {
    
    try{
      const user = req.user;
      const {
        type,
        relatedId,
        promotionId,
        amount,
        operator,
        page = 1,
        limit = 10
      } = req.query;
      const filters = {
        userId: user.id
      };

      if (type) {
        if (typeof type !== 'string') {
          return res.status(400).json({ error: "type must be a string" });
        }
        filters.type = type;
        if (relatedId) {
          const parsedId = parseInt(relatedId);
          if (isNaN(parsedId)) {
            return res.status(400).json({ error: "relatedId must be a number" });
          }
          filters.relatedId = parsedId;
        }
      }

      if ((amount && !operator) || (!amount && operator)) {
        return res.status(400).json({ error: "Both amount and operator must be provided together." });
      }

      const amountFilter = {};
      if (amount && operator) {
        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || !['gte', 'lte'].includes(operator)) {
          return res.status(400).json({ error: "Invalid amount or operator." });
        }
        amountFilter[operator] = parsedAmount;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        ...filters,
        ...(Object.keys(amountFilter).length > 0 && { amount: amountFilter }),
        ...(promotionId && {
          promotions: {
            some: {
              promotionId: parseInt(promotionId)
            }
          }
        })
      };

      const [count, results] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { utorid: true } },
            promotions: { select: { promotionId: true } }
          }
        })
      ]);

      const formatted = results.map(tx => ({
        id: tx.id,
        type: tx.type,
        spent: tx.spent ? parseFloat(tx.spent) : undefined,
        amount: tx.amount,
        relatedId: tx.relatedId ?? undefined,
        promotionIds: tx.promotions.map(p => p.promotionId),
        remark: tx.remark || "",
        createdBy: tx.createdBy.utorid
      }));

      return res.json({
        count,
        results: formatted
      });

    }catch(err){
      console.error("Error in retrieving your transactions in backend/usersme", err);
      return res.status(500).json({error: "Internal Server Error."})
    }
})
/**
 * POST /transactions - transfer
 */
app.post('/users/:userId/transactions', authenticate, 
  authorize(["regular", "cashier", "manager", "superuser"]), async (req, res) => {
    try{
      const sender = req.user;
      const recipientId = parseInt(req.params.userId);
      const {type, amount, remark} = req.body;
      if(!type){
        return res.status(400).json({error: "Transaction type cannot be empty."});
      }
      if(typeof type !== 'string' || type !== "transfer"){
        return res.status(400).json({error: "Type of transaction must be 'transfer'."})
      }
      if(!amount || typeof amount !== 'number'){
        return res.status(400).json({error: "Amount cannot be empty. Please enter a number."});
      }
      if(amount <=0 ){
        return res.status(400).json({error: "Amount must be a positive value."});
      }
      if(remark && typeof remark !== 'string'){
        return res.status(400).json({error: "Remark must be of type string"});
      }

      const recipient = await prisma.user.findUnique({where: {id: recipientId}});
      if(!recipient){
        return res.status(404).json({error: "Recipient user not found."});
      }
      const senderUser = await prisma.user.findUnique({where: {id: sender.id}});
      if(!senderUser.verified){
        return res.status(403).json({error: "Sender is not verified"});
      }
      if(senderUser.points < amount){
        return res.status(400).json({error: "Insufficient points to make this transfer transaction."});
      }

      const [senderUpdate, recipientUpdate, sentTx, receivedTx] = await prisma.$transaction([
        prisma.user.update({
          where: {id: senderUser.id},
          data: {points: {decrement: amount}}
        }),
        prisma.user.update({
          where: {id: recipientId},
          data: {points: {increment: amount}}
        }),
        prisma.transaction.create({
          data: {
            userId: senderUser.id,
            //user: senderUser,
            createdById: senderUser.id,
            //createdBy: senderUser,
            type: 'transfer',
            amount: -amount,
            remark: remark ? remark : '',
            relatedId: recipientId
          }
        }),
        prisma.transaction.create({
          data: {
            userId: recipientId,
            //user: recipient,
            createdById: senderUser.id,
            //createdBy: senderUser,
            type: 'transfer',
            amount,
            remark: remark ? remark : '',
            relatedId: senderUser.id
          }
        })
      ]);
      if(!sentTx || !receivedTx){
        return res.status(500).json({error: "Transfer was not processed due to internal server error.."});
      }
      return res.status(200).json({
        id: sentTx.id,
        sender: senderUser.utorid,
        recipient: recipient.utorid,
        type: 'transfer',
        sent: amount,
        remark: remark ? remark : '',
        createdBy: senderUser.utorid
      });

    }catch(err){
      console.error("Error transfer transaction in backend", err.stack);
      return res.status(500).json({ error: "Internal Server Error in transfer" });
    }
});



/**
 * POST /events
 */
app.post('/events', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
        const { name, description, location, startTime, endTime, capacity, points } = req.body;

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request payload cannot be empty." });
        }

        if (!name || !description || !location || !startTime || !endTime || points === undefined) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        if (end <= start) {
            return res.status(400).json({ error: "endTime must be after startTime." });
        }

        if (capacity !== null && (typeof capacity !== "number" || capacity <= 0)) {
            return res.status(400).json({ error: "Invalid capacity" });
        }

        if (!Number.isInteger(points) || points <= 0) {
            return res.status(400).json({ error: "Invalid points" });
        }

        const event = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime: start,
                endTime: end,
                capacity,
                pointsRemain: points, 
                pointsAwarded: 0, 
                published: false, 
            }
        });

        return res.status(201).json({
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            capacity: event.capacity,
            pointsRemain: event.pointsRemain,
            pointsAwarded: event.pointsAwarded,
            published: event.published,
            organizers: [],
            guests: []
        });

    } catch (err) {
        console.error("Error creating event:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * GET /events
 */
app.get('/events', authenticate, authorize(["regular", "cashier", "manager", "superuser"]), async (req, res) => {
  try {
      let { name, location, started, ended, showFull = false, published, page = 1, limit = 10 } = req.query;

      page = parseInt(page, 10);
      limit = parseInt(limit, 10);

      if (isNaN(page) || page < 1) {
          return res.status(400).json({ error: "Invalid page number." });
      }
      if (isNaN(limit) || limit < 1) {
          return res.status(400).json({ error: "Invalid limit value." });
      }

      const startedBool = started === "true" ? true : started === "false" ? false : undefined;
      const endedBool = ended === "true" ? true : ended === "false" ? false : undefined;
      const publishedBool = published === "true" ? true : published === "false" ? false : undefined;
      showFull = showFull === "true";

      if (startedBool !== undefined && endedBool !== undefined) {
          return res.status(400).json({ error: "Cannot specify both 'started' and 'ended' filters." });
      }

      const where = {};

      if (!["manager", "superuser"].includes(req.user.role)) {
          where.published = true;
      } else if (publishedBool !== undefined) {
          where.published = publishedBool;
      }

      if (name) {
          where.name = { contains: name, mode: "insensitive" };
      }

      if (location) {
          where.location = { contains: location, mode: "insensitive" };
      }

      const now = new Date();

      if (startedBool === true) {
          where.startTime = { lte: now };
      } else if (startedBool === false) {
          where.startTime = { gt: now };
      }

      if (endedBool === true) {
          where.endTime = { lte: now };
      } else if (endedBool === false) {
          where.endTime = { gt: now };
      }

      if (!showFull) {
          where.OR = [
              { capacity: null },
              { guests: { some: {} } }
          ];
      }

      const skip = Math.max(0, (page - 1) * limit);

      const totalCount = await prisma.event.count({ where });

      const events = await prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: "asc" },
          select: {
              id: true,
              name: true,
              location: true,
              startTime: true,
              endTime: true,
              capacity: true,
              pointsRemain: true,
              pointsAwarded: true,
              published: true,
              _count: { select: { guests: true } }
          }
      });

      return res.json({
          count: totalCount,
          results: events.map(event => {
              const base = {
                  id: event.id,
                  name: event.name,
                  location: event.location,
                  startTime: event.startTime.toISOString(),
                  endTime: event.endTime.toISOString(),
                  capacity: event.capacity,
                  numGuests: event._count.guests
              };

              if (["manager", "superuser"].includes(req.user.role)) {
                  base.pointsRemain = event.pointsRemain;
                  base.pointsAwarded = event.pointsAwarded;
                  base.published = event.published;
              }

              return base;
          })
      });

  } catch (err) {
      console.error("Error retrieving events:", err);
      return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /events/:eventId
 */
app.get('/events/:eventId', authenticate, async (req, res) => {
  try {
      const { eventId } = req.params;
      const user = req.user;

      const eventIdInt = parseInt(eventId, 10);
      if (isNaN(eventIdInt)) {
          return res.status(400).json({ error: "Invalid event ID." });
      }

      const event = await prisma.event.findUnique({
          where: { id: eventIdInt },
          select: {
              id: true,
              name: true,
              description: true,
              location: true,
              startTime: true,
              endTime: true,
              capacity: true,
              pointsRemain: true,
              pointsAwarded: true,
              published: true,
              organizers: {
                  select: {
                      user: { select: { id: true, utorid: true, name: true } }
                  }
              },
              guests: {
                  select: {
                      user: { select: { id: true, utorid: true, name: true } }
                  }
              },
              _count: { select: { guests: true } }
          }
      });

      if (!event) {
          return res.status(404).json({ error: "Event not found." });
      }

      const isOrganizer = event.organizers.some(org => org.user.id === user.id);
      const isManagerOrHigher = ["manager", "superuser"].includes(user.role);
      const isAllowedRegular = event.published;

      if (!(isManagerOrHigher || isOrganizer || isAllowedRegular)) {
          return res.status(403).json({ error: "Forbidden" });
      }

      const baseResponse = {
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          capacity: event.capacity,
          organizers: event.organizers.map(org => ({
              id: org.user.id,
              utorid: org.user.utorid,
              name: org.user.name
          }))
      };

      if (!isManagerOrHigher && !isOrganizer) {
          baseResponse.numGuests = event._count.guests;
          return res.json(baseResponse);
      }

      return res.json({
          ...baseResponse,
          pointsRemain: event.pointsRemain,
          pointsAwarded: event.pointsAwarded,
          published: event.published,
          guests: event.guests.map(guest => ({
              id: guest.user.id,
              utorid: guest.user.utorid,
              name: guest.user.name
          }))
      });

  } catch (err) {
      console.error("Error retrieving event:", err);
      return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PATCH /events/:eventId
 */
app.patch('/events/:eventId', authenticate, async (req, res) => {
    try {
      const { eventId } = req.params;
      const eventIdInt = parseInt(eventId, 10);
      if (isNaN(eventIdInt)) {
        return res.status(400).json({ error: "Invalid event ID format." });
      }
  
      const existingEvent = await prisma.event.findUnique({
        where: { id: eventIdInt },
        include: {
          organizers: true,  
          guests: true     
        }
      });
  
      if (!existingEvent) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      const user = req.user; 
      const isManagerOrHigher = (user.role === "manager" || user.role === "superuser");
      
      const isOrganizer = existingEvent.organizers.some(o => o.userId === user.id);
  
      if (!isManagerOrHigher && !isOrganizer) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      let {
        name,
        description,
        location,
        startTime,
        endTime,
        capacity,
        points,
        published
      } = req.body;
  
      const updateData = {};
  
      const originalStartTime = existingEvent.startTime;
      const originalEndTime = existingEvent.endTime;
      const originalCapacity = existingEvent.capacity;
      const originalPointsRemain = existingEvent.pointsRemain;
  
      const now = new Date();
      const alreadyStarted = (now >= originalStartTime);
  
      if (name !== undefined) {
        if (alreadyStarted) {
          return res.status(400).json({ error: "Cannot update name" });
        }
        if (typeof name !== "string") {
          return res.status(400).json({ error: "Invalid name field." });
        }
        updateData.name = name;
      }
  
      if (description !== undefined) {
        if (alreadyStarted) {
          return res.status(400).json({ error: "Cannot update description" });
        }
        if (typeof description !== "string") {
          return res.status(400).json({ error: "Invalid description field." });
        }
        updateData.description = description;
      }
  
      if (location !== undefined) {
        if (alreadyStarted) {
          return res.status(400).json({ error: "Cannot update location" });
        }
        if (typeof location !== "string") {
          return res.status(400).json({ error: "Invalid location field." });
        }
        updateData.location = location;
      }
  

      if (startTime !== undefined) {

        if (alreadyStarted) {
          return res.status(400).json({ error: "Cannot update startTime after event start." });
        }
        const parsedStart = new Date(startTime);
        if (isNaN(parsedStart.getTime())) {
          return res.status(400).json({ error: "Invalid startTime format" });
        }

        if (parsedStart < now) {
          return res.status(400).json({ error: "startTime cannot be in the past." });
        }
        updateData.startTime = parsedStart;
      }
  
      if (endTime !== undefined) {
        const parsedEnd = new Date(endTime);
        if (isNaN(parsedEnd.getTime())) {
          return res.status(400).json({ error: "Invalid endTime format" });
        }

        if (now > originalEndTime) {
          return res.status(400).json({ error: "Cannot update endTime after the original end time has passed." });
        }

        const currentStart = (updateData.startTime) ? updateData.startTime : originalStartTime;
        if (parsedEnd <= currentStart) {
          return res.status(400).json({ error: "endTime must be after startTime." });
        }
        updateData.endTime = parsedEnd;
      }
  
      if (capacity !== undefined) {
        if (capacity !== null) {
          if (typeof capacity !== "number" || capacity <= 0) {
            return res.status(400).json({ error: "Capacity must be a positive number or null." });
          }
        }
        if (alreadyStarted) {
          return res.status(400).json({ error: "Cannot update capacity" });
        }
        const currentNumGuests = existingEvent.guests.length;
        if (capacity !== null && capacity < currentNumGuests) {
          return res.status(400).json({ error: "Cannot reduce capacity." });
        }
        updateData.capacity = capacity;
      }
  
      if (points !== undefined) {
        if (!isManagerOrHigher) {
          return res.status(403).json({ error: "Only managers can update event points." });
        }
        if (typeof points !== "number" || points <= 0) {
          return res.status(400).json({ error: "points must be a positive integer." });
        }

        const alreadyAwarded = existingEvent.pointsAwarded || 0;
        const oldTotal = (existingEvent.pointsRemain ?? 0) + alreadyAwarded;
        if (points < oldTotal) {
          return res.status(400).json({ 
            error: "Cannot reduce total allocated points"
          });
        }
        const newPointsRemain = points - alreadyAwarded;
        updateData.pointsRemain = newPointsRemain;
      }
  
      if (published !== undefined) {
        if (!isManagerOrHigher) {
          return res.status(403).json({ error: "Only managers can publish the event." });
        }
        if (published !== true) {
          return res.status(400).json({ error: "published can only be set to true." });
        }
        updateData.published = true;
      }
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update or constraints not met." });
      }
  
      const updatedEvent = await prisma.event.update({
        where: { id: existingEvent.id },
        data: updateData
      });
  
      const response = {
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location
      };

      for (const field of Object.keys(updateData)) {
        if (!["name","location"].includes(field)) {
          response[field] = updatedEvent[field];
        }
      }
  
      return res.status(200).json(response);
  
    } catch (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
/**
 * DELETE /events/:eventId
 */
app.delete('/events/:eventId', authenticate, authorize(["manager","superuser"]), async (req, res) => {
    try {
      const { eventId } = req.params;
      const eventIdInt = parseInt(eventId, 10);
      if (isNaN(eventIdInt)) {
        return res.status(400).json({ error: "Invalid event ID format." });
      }
  
      const existingEvent = await prisma.event.findUnique({
        where: { id: eventIdInt }
      });
      if (!existingEvent) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      if (existingEvent.published) {
        return res.status(400).json({ error: "Cannot delete an event that has already been published." });
      }
  
      await prisma.event.delete({
        where: { id: eventIdInt }
      });
  
      return res.status(204).send();
    } catch (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  /**
 * POST /events/:eventId/organizers
 */
app.post('/events/:eventId/organizers', authenticate, authorize(["manager","superuser"]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }
  
      const { utorid } = req.body;
      if (!utorid) {
        return res.status(400).json({ error: "Missing utorid field." });
      }
  
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          guests: { 
            select: { userId: true } 
          },
          organizers: { 
            select: { userId: true } 
          }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      const now = new Date();
      if (event.endTime <= now) {
        return res.status(410).json({ error: "Event has ended." });
      }
  
      const user = await prisma.user.findUnique({
        where: { utorid },
        select: { id: true, utorid: true, name: true }
      });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      const isGuest = event.guests.some(g => g.userId === user.id);
      if (isGuest) {
        return res.status(400).json({ error: "User is registered as a guest." });
      }
  
      const isAlreadyOrganizer = event.organizers.some(o => o.userId === user.id);
      if (isAlreadyOrganizer) {
        return res.status(400).json({ error: "User is already an organizer." });
      }
  
      await prisma.eventOrganizer.create({
        data: {
          eventId: event.id,
          userId: user.id
        }
      });

      const updatedEvent = await prisma.event.findUnique({
        where: { id: event.id },
        select: {
          id: true,
          name: true,
          location: true,
          organizers: {
            select: {
              user: {
                select: {
                  id: true,
                  utorid: true,
                  name: true
                }
              }
            }
          }
        }
      });

      const organizersArr = updatedEvent.organizers.map(o => ({
        id: o.user.id,
        utorid: o.user.utorid,
        name: o.user.name
      }));
  
      return res.status(201).json({
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        organizers: organizersArr
      });
    } catch (err) {
      console.error("Error adding organizer:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  /**
 * DELETE /events/:eventId/organizers/:userId
 */
app.delete('/events/:eventId/organizers/:userId', authenticate, authorize(["manager","superuser"]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }
      
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid user ID." });
      }
  
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizers: { 
            select: { userId: true } 
          }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }

      const isOrganizer = event.organizers.some(o => o.userId === userId);
      if (!isOrganizer) {
        return res.status(404).json({ error: "User is not an organizer for this event." });
      }
  
      await prisma.eventOrganizer.delete({
        where: {
          eventId_userId: {
            eventId: eventId,
            userId: userId
          }
        }
      });
  
      return res.status(204).send();
    } catch (err) {
      console.error("Error removing organizer:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  /**
 * POST /events/:eventId/guests
 */
app.post('/events/:eventId/guests', authenticate, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }
  
      const userRole = req.user.role;  
      const userId = req.user.id;
  
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizers: { select: { userId: true } }, 
          guests: { select: { userId: true } }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }

      const isManagerOrHigher = (userRole === "manager" || userRole === "superuser");
      const isOrganizer = event.organizers.some(o => o.userId === userId);
      if (!isManagerOrHigher && !isOrganizer) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      if (!isManagerOrHigher && !event.published) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      const now = new Date();
      if (event.endTime <= now) {
        return res.status(410).json({ error: "Event has ended." });
      }
  
      if (event.capacity !== null) {
        if (event.guests.length >= event.capacity) {
          return res.status(410).json({ error: "Event is full." });
        }
      }
  
      const { utorid } = req.body || {};
      if (!utorid) {
        return res.status(400).json({ error: "Missing utorid field." });
      }
  
      const targetUser = await prisma.user.findUnique({
        where: { utorid },
        select: { id: true, name: true, utorid: true }
      });
      if (!targetUser) {
        return res.status(404).json({ error: "User not found." });
      }
  
      const isOrganizerAlready = event.organizers.some(o => o.userId === targetUser.id);
      if (isOrganizerAlready) {
        return res.status(400).json({ error: "User is registered as an organizer." });
      }
  
      const isGuestAlready = event.guests.some(g => g.userId === targetUser.id);
      if (isGuestAlready) {
        return res.status(400).json({ error: "User is already a guest." });
      }
  
      await prisma.eventGuest.create({
        data: {
          eventId: eventId,
          userId: targetUser.id
        }
      });

      const updated = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          name: true,
          location: true,
          guests: true
        }
      });
      const numGuests = updated.guests.length;
  
      return res.status(201).json({
        id: updated.id,
        name: updated.name,
        location: updated.location,
        guestAdded: {
          id: targetUser.id,
          utorid: targetUser.utorid,
          name: targetUser.name
        },
        numGuests
      });
    } catch (err) {
      console.error("Error adding guest:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  /**
 * DELETE /events/:eventId/guests/:userId
 */
app.delete('/events/:eventId/guests/:userId', authenticate, authorize(["manager","superuser"]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }
  
      const userIdToRemove = parseInt(req.params.userId, 10);
      if (isNaN(userIdToRemove) || userIdToRemove <= 0) {
        return res.status(400).json({ error: "Invalid user ID." });
      }
  
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          guests: { select: { userId: true } }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      const now = new Date();
      if (event.endTime <= now) {
        return res.status(410).json({ error: "Event has ended." });
      }
  
      const isGuest = event.guests.some(g => g.userId === userIdToRemove);
      if (!isGuest) {
        return res.status(404).json({ error: "User is not a guest for this event." });
      }
  
      await prisma.eventGuest.delete({
        where: {
          eventId_userId: {
            eventId: eventId,
            userId: userIdToRemove
          }
        }
      });

      return res.status(204).send();
    } catch (err) {
      console.error("Error removing guest:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  /**
 * POST /events/:eventId/guests/me
 */
app.post('/events/:eventId/guests/me', authenticate, authorize(["regular","cashier","manager","superuser"]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }
  
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          guests: { select: { userId: true } }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      const now = new Date();
      if (event.endTime <= now) {
        return res.status(410).json({ error: "Event has ended." });
      }
  
      if (event.capacity !== null && event.guests.length >= event.capacity) {
        return res.status(410).json({ error: "Event is full." });
      }
  
      const userId = req.user.id;
      const alreadyGuest = event.guests.some(g => g.userId === userId);
      if (alreadyGuest) {
        return res.status(400).json({ error: "User is already on the guest list." });
      }
  
      const isOrganizer = await prisma.eventOrganizer.findUnique({
        where: {
          eventId_userId: {
            eventId: eventId,
            userId: userId
          }
        }
      });
      if (isOrganizer) {
        return res.status(400).json({ error: "User is an organizer and cannot be a guest." });
      }
  
      await prisma.eventGuest.create({
        data: {
          eventId: event.id,
          userId: userId
        }
      });
  
      const updatedEvent = await prisma.event.findUnique({
        where: { id: event.id },
        select: {
          id: true,
          name: true,
          location: true,
          guests: true
        }
      });

      const numGuests = updatedEvent.guests.length;
  
      return res.status(201).json({
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        guestAdded: {
          id: req.user.id,
          utorid: req.user.utorid,
          name: req.user.name || null
        },
        numGuests
      });
    } catch (err) {
      console.error("Error adding current user as a guest:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
  /**
 * POST /events/:eventId/transactions
 */
app.post('/events/:eventId/transactions', authenticate, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Invalid event ID." });
      }

      const user = req.user; 
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizers: { select: { userId: true } },
          guests: { select: { userId: true } }
        }
      });
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
  
      const isManagerOrSuperuser =
        user.role === "manager" || user.role === "superuser";
      const isOrganizer = event.organizers.some(o => o.userId === user.id);
  
      if (!isManagerOrSuperuser && !isOrganizer) {
        return res
          .status(403)
          .json({ error: "Forbidden" });
      }
  
      const { type, utorid, amount, remark } = req.body || {};
      if (type !== "event") {
        return res.status(400).json({ error: "Transaction type must be 'event'." });
      }
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive integer." });
      }

      const eventPointsRemain = event.pointsRemain ?? 0;
      const eventPointsAwarded = event.pointsAwarded ?? 0;
  
      const creatorId = user.id;
      const creatorUtorid = user.utorid;

      if (utorid) {
        const targetUser = await prisma.user.findUnique({
          where: { utorid },
          select: { id: true, utorid: true }
        });
        if (!targetUser) {
          return res.status(404).json({ error: "User not found." });
        }
  
        const isGuest = event.guests.some(g => g.userId === targetUser.id);
        if (!isGuest) {
          return res.status(400).json({ error: "User is not on the guest list." });
        }

        if (amount > eventPointsRemain) {
          return res
            .status(400)
            .json({ error: "Not enough remaining points" });
        }
  
        const newTransaction = await prisma.$transaction(async (tx) => {
          const createdTx = await tx.transaction.create({
            data: {
              userId: targetUser.id,  
              createdById: creatorId, 
              type: "event",
              amount,
              remark: remark || "",
              relatedId: eventId    
            }
          });

          await tx.event.update({
            where: { id: eventId },
            data: {
              pointsRemain: { decrement: amount },
              pointsAwarded: { increment: amount }
            }
          });
  
          await tx.user.update({
            where: { id: targetUser.id },
            data: {
              points: { increment: amount }
            }
          });
  
          return createdTx;
        });
  
        return res.status(201).json({
          id: newTransaction.id,
          recipient: targetUser.utorid,
          awarded: amount,
          type: "event",
          relatedId: eventId,
          remark: newTransaction.remark,
          createdBy: creatorUtorid
        });
      } else {
        const guestList = event.guests; 
        if (guestList.length === 0) {
          return res.status(400).json({ error: "No guests to award points to." });
        }
  
        const totalNeeded = amount * guestList.length;
        if (totalNeeded > eventPointsRemain) {
          return res
            .status(400)
            .json({ error: "Not enough remaining points." });
        }
  
        const results = await prisma.$transaction(async (tx) => {
          const createdTxs = [];
          for (const g of guestList) {
            const newTx = await tx.transaction.create({
              data: {
                userId: g.userId,
                createdById: creatorId,
                type: "event",
                amount,
                remark: remark || "",
                relatedId: eventId
              }
            });
            createdTxs.push(newTx);
  
            await tx.user.update({
              where: { id: g.userId },
              data: { points: { increment: amount } }
            });
          }
  
          await tx.event.update({
            where: { id: eventId },
            data: {
              pointsRemain: { decrement: totalNeeded },
              pointsAwarded: { increment: totalNeeded }
            }
          });
  
          return createdTxs;
        });
  
        const responseArray = results.map((t) => ({
          id: t.id,
          recipient: event.guests.find(g => g.userId === t.userId)?.userId, 
          awarded: t.amount,
          type: "event",
          relatedId: eventId,
          remark: t.remark,
          createdBy: creatorUtorid
        }));
  
  
        return res.status(201).json(responseArray);
      }
    } catch (err) {
      console.error("Error creating event reward transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  /**
 * POST /transactions
 */
app.post('/transactions', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { utorid, type, spent, amount, relatedId, promotionIds, remark } = req.body;

    if (!utorid || !type || !["purchase", "adjustment"].includes(type)) {
      return res.status(400).json({ error: "Missing" });
    }

    const promoIdsArray = Array.isArray(promotionIds) ? promotionIds : [];

    const targetUser = await prisma.user.findUnique({
      where: { utorid },
      select: { id: true, suspicious: true, points: true }
    });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    for (const pid of promoIdsArray) {
      const promo = await prisma.promotion.findUnique({ where: { id: pid } });
      if (!promo) {
        return res.status(400).json({ error: `Promotion id=${pid} is invalid.` });
      }
    }

    if (type === "purchase") {
      if (!["cashier", "manager", "superuser"].includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (!spent || typeof spent !== "number" || spent <= 0) {
        return res.status(400).json({ error: "Invalid spent amount." });
      }

      const earned = user.suspicious ? 0 : Math.round(spent * 4);

      const createdTx = await prisma.$transaction(async (tx) => {
        const newTx = await tx.transaction.create({
          data: {
            userId: targetUser.id,
            createdById: user.id,
            type: "purchase",
            spent,
            amount: earned,
            remark: remark || ""
          }
        });

        if (earned > 0) {
          await tx.user.update({
            where: { id: targetUser.id },
            data: { points: { increment: earned } }
          });
        }

        for (const pid of promoIdsArray) {
          await tx.transactionPromotion.create({
            data: {
              transactionId: newTx.id,
              promotionId: pid
            }
          });
        }

        return newTx;
      });

      return res.status(201).json({
        id: createdTx.id,
        utorid,
        type: "purchase",
        spent,
        earned,
        remark: createdTx.remark,
        promotionIds: promoIdsArray,
        createBy: user.utorid
      });
    }

    if (type === "adjustment") {
      if (!["manager", "superuser"].includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (typeof amount !== "number" || !relatedId) {
        return res.status(400).json({ error: "Missing" });
      }

      const originalTx = await prisma.transaction.findUnique({
        where: { id: relatedId },
        select: { id: true, userId: true, type: true }
      });
      if (!originalTx) {
        return res.status(404).json({ error: "Related transaction not found." });
      }

      const createdTx = await prisma.$transaction(async (tx) => {
        const newAdjustment = await tx.transaction.create({
          data: {
            userId: targetUser.id,
            createdById: user.id,
            type: "adjustment",
            amount,
            relatedId,
            remark: remark || ""
          }
        });

        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            points: { increment: amount }
          }
        });

        for (const pid of promoIdsArray) {
          await tx.transactionPromotion.create({
            data: {
              transactionId: newAdjustment.id,
              promotionId: pid
            }
          });
        }

        return newAdjustment;
      });

      return res.status(201).json({
        id: createdTx.id,
        utorid,
        amount,
        type: "adjustment",
        relatedId,
        remark: createdTx.remark,
        promotionIds: promoIdsArray,
        createBy: user.utorid
      });
    }

  } catch (err) {
    console.error("Error creating transaction:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

  /**
 * GET /transactions
 */
app.get('/transactions', authenticate, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!["manager", "superuser"].includes(currentUser.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      const {
        name,
        createdBy,
        suspicious,
        promotionId,
        type,
        relatedId,
        amount,
        operator,
        page = 1,
        limit = 10
      } = req.query;
  
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      if (pageNum < 1) {
        return res.status(400).json({ error: "page must be >= 1" });
      }
      if (limitNum < 1) {
        return res.status(400).json({ error: "limit must be >= 1" });
      }
  
      const whereClause = {};
  
      if (suspicious !== undefined) {
        if (suspicious === "true") {
          whereClause.suspicious = true;
        } else if (suspicious === "false") {
          whereClause.suspicious = false;
        } else {
          return res.status(400).json({ error: "suspicious must be 'true' or 'false'." });
        }
      }
  
      if (type) {
        whereClause.type = type.toUpperCase(); 
      }
  
      if (relatedId !== undefined) {
        if (!type) {
          return res.status(400).json({ error: "relatedId must be used with type." });
        }
        const relatedIdNum = parseInt(relatedId, 10);
        if (isNaN(relatedIdNum)) {
          return res.status(400).json({ error: "relatedId must be a number." });
        }
        whereClause.relatedId = relatedIdNum;
      }
  
      if (name) {
        whereClause.user = {
          OR: [
            { utorid: { contains: name } },
            { name: { contains: name } }
          ]
        };
      }

      if (createdBy) {
        whereClause.createdBy = {
          utorid: createdBy  
        };
      }
  
      if (promotionId !== undefined) {
        const promoIdNum = parseInt(promotionId, 10);
        if (isNaN(promoIdNum)) {
          return res.status(400).json({ error: "promotionId must be a number." });
        }
        whereClause.promotions = {
          some: {
            promotionId: promoIdNum
          }
        };
      }
  
      if (amount !== undefined) {
        if (!operator || !["gte", "lte"].includes(operator)) {
          return res.status(400).json({
            error: "When specifying amount, must also specify operator = gte or lte."
          });
        }
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum)) {
          return res.status(400).json({ error: "amount must be a number." });
        }
        whereClause.amount = {
          [operator]: amountNum 
        };
      }
  
      const totalCount = await prisma.transaction.count({
        where: whereClause
      });
  
      const skip = (pageNum - 1) * limitNum;
  
      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { id: "asc" },
        include: {
          user: {
            select: { utorid: true, name: true }
          },
          createdBy: {
            select: { utorid: true }
          },
          promotions: {
            select: {
              promotionId: true
            }
          }
        }
      });
  
      const results = transactions.map((tx) => {
        const promoIds = tx.promotions.map((p) => p.promotionId);
  
        const r = {
          id: tx.id,
          utorid: tx.user.utorid,      
          amount: tx.amount,
          type: tx.type.toLowerCase(), 
          spent: tx.spent || undefined,  
          promotionIds: promoIds,
          suspicious: tx.suspicious,
          remark: tx.remark,
          createBy: tx.createdBy ? tx.createdBy.utorid : null,
          relatedId: tx.relatedId
        };
  
        if (tx.type === "REDEMPTION") {
          r["redeemed"] = Math.abs(tx.amount);
        }
  
        return r;
      });
  
      return res.json({
        count: totalCount,
        results
      });
    } catch (err) {
      console.error("Error retrieving transactions:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  /**
 * GET /transactions/:transactionId
 */
app.get('/transactions/:transactionId', authenticate, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!["manager", "superuser"].includes(currentUser.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      const { transactionId } = req.params;
      const txId = parseInt(transactionId, 10);
      if (isNaN(txId) || txId <= 0) {
        return res.status(400).json({ error: "Invalid transaction ID." });
      }
  
      const tx = await prisma.transaction.findUnique({
        where: { id: txId },
        include: {
          user: {
            select: { utorid: true, name: true }
          },
          createdBy: {
            select: { utorid: true }
          },
          promotions: {
            select: { promotionId: true }
          }
        }
      });
      if (!tx) {
        return res.status(404).json({ error: "Transaction not found." });
      }
  
      const promotionIds = tx.promotions.map((p) => p.promotionId);
  
  
      let spentValue = undefined;
      let redeemedValue = undefined;
      if (tx.type === "purchase") {
        spentValue = tx.spent || 0; 
      } else if (tx.type === "REDEMPTION") {

        redeemedValue = Math.abs(tx.amount);
      }
  
      const result = {
        id: tx.id,
        utorid: tx.user.utorid,      
        type: tx.type.toLowerCase(),
        spent: spentValue,
        amount: tx.amount,
        promotionIds,
        suspicious: tx.suspicious,
        remark: tx.remark,
        createBy: tx.createdBy ? tx.createdBy.utorid : null,
        relatedId: tx.relatedId
      };
      if (redeemedValue !== undefined) {
        result["redeemed"] = redeemedValue;
      }
  
      return res.json(result);
    } catch (err) {
      console.error("Error retrieving transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  app.patch('/transactions/:transactionId/processed', authenticate, authorize(["cashier", "manager", "superuser"]), async (req, res) => {
    try {
        const { processed } = req.body;
        const transactionId = parseInt(req.params.transactionId, 10);

        if (!processed || typeof processed !== "boolean") {
            return res.status(400).json({ error: "Processed must be true." });
        }

        const tx = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                user: true,
                createdBy: { select: { utorid: true } }
            }
        });

        if (!tx) {
            return res.status(404).json({ error: "Transaction not found." });
        }

        if (tx.type !== "REDEMPTION") {
            return res.status(400).json({ error: "Only redemption transactions can be processed." });
        }

        if (tx.processed === true) {
            return res.status(400).json({ error: "Transaction already processed." });
        }

        await prisma.$transaction(async (txClient) => {
            await txClient.user.update({
                where: { id: tx.userId },
                data: {
                    points: { decrement: Math.abs(tx.amount) }
                }
            });

            await txClient.transaction.update({
                where: { id: transactionId },
                data: {
                    processed: true,
                    processedById: req.user.id
                }
            });
        });

        return res.status(200).json({
            id: tx.id,
            utorid: tx.user.utorid,
            type: "redemption",
            processedBy: req.user.utorid,
            redeemed: Math.abs(tx.amount),
            remark: tx.remark,
            createdBy: tx.createdBy?.utorid || null
        });

    } catch (err) {
        console.error("Error processing redemption transaction:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * PATCH /transactions/:transactionId/suspicious
 */
app.patch('/transactions/:transactionId/suspicious', authenticate, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!["manager", "superuser"].includes(currentUser.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      const { transactionId } = req.params;
      const txId = parseInt(transactionId, 10);
      if (isNaN(txId) || txId <= 0) {
        return res.status(400).json({ error: "Invalid transaction ID." });
      }
  
      const { suspicious } = req.body;
      if (typeof suspicious !== "boolean") {
        return res.status(400).json({ error: "suspicious must be boolean true or false." });
      }
  
      const oldTx = await prisma.transaction.findUnique({
        where: { id: txId },
        include: {
          user: true,      
          createdBy: true,
          promotions: { select: { promotionId: true } }
        }
      });
      if (!oldTx) {
        return res.status(404).json({ error: "Transaction not found." });
      }
  
      const oldSuspicious = oldTx.suspicious;
      const userId = oldTx.userId;
      const txAmount = oldTx.amount || 0;
  
      if (oldSuspicious === suspicious) {
        return res.status(200).json({ message: "No change in suspicious flag." });
      }

      const updatedTx = await prisma.$transaction(async (tx) => {
  
        if (!oldSuspicious && suspicious) {
          await tx.user.update({
            where: { id: userId },
            data: { points: { decrement: txAmount } }
          });
        } else if (oldSuspicious && !suspicious) {
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: txAmount } }
          });
        }
  
        const newTx = await tx.transaction.update({
          where: { id: txId },
          data: {
            suspicious
          }
        });
        return newTx;
      });
  
      const promotionIds = oldTx.promotions.map((p) => p.promotionId);
  
      let spentValue = undefined;
      let redeemedValue = undefined;
      if (oldTx.type === "purchase") {
        spentValue = oldTx.spent;
      } else if (oldTx.type === "REDEMPTION") {
        redeemedValue = Math.abs(oldTx.amount);
      }
  
      const response = {
        id: updatedTx.id,
        utorid: oldTx.user.utorid,
        type: oldTx.type.toLowerCase(),
        spent: spentValue,
        amount: updatedTx.amount, 
        promotionIds,
        suspicious: updatedTx.suspicious,
        remark: updatedTx.remark,
        createBy: oldTx.createdBy ? oldTx.createdBy.utorid : null,
        relatedId: oldTx.relatedId
      };
      if (redeemedValue !== undefined) {
        response["redeemed"] = redeemedValue;
      }
  
      return res.json(response);
  
    } catch (err) {
      console.error("Error updating suspicious flag:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  /**
 * POST /promotions
 */
app.post('/promotions', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
      const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
  
      if (!name || !description || !type || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields." });
      }
  
      const allowedTypes = ["automatic", "one-time"];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid promotion type" });
      }
  
      const mappedType = type === "one-time" ? "oneTime" : type;
  
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);
  
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      if (start < now) {
        return res.status(400).json({ error: "startTime must not be in the past." });
      }
      if (end <= start) {
        return res.status(400).json({ error: "endTime must be after startTime." });
      }
  
      if (minSpending !== undefined && (typeof minSpending !== 'number' || minSpending <= 0)) {
        return res.status(400).json({ error: "minSpending must be a positive number." });
      }
  
      if (rate !== undefined && (typeof rate !== 'number' || rate <= 0)) {
        return res.status(400).json({ error: "rate must be a positive number." });
      }
  
      if (points !== undefined && (!Number.isInteger(points) || points < 0)) {
        return res.status(400).json({ error: "points must be a non-negative integer." });
      }
  
      const promotion = await prisma.promotion.create({
        data: {
          name,
          description,
          type: mappedType,
          startTime: start,
          endTime: end,
          minSpending,
          rate,
          points
        }
      });
  
      return res.status(201).json({
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: type, 
        startTime: promotion.startTime.toISOString(),
        endTime: promotion.endTime.toISOString(),
        minSpending: promotion.minSpending,
        rate: promotion.rate,
        points: promotion.points || 0
      });
    } catch (err) {
      console.error("Error creating promotion:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

/**
 * GET /promotions
 */
app.get('/promotions', authenticate, authorize(["regular", "cashier", "manager", "superuser"]), async (req, res) => {
    try {
      const user = req.user;
      let { name, type, started, ended, page = 1, limit = 10 } = req.query;
  
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
  
      if (isNaN(page) || page < 1) return res.status(400).json({ error: "Invalid page number." });
      if (isNaN(limit) || limit < 1) return res.status(400).json({ error: "Invalid limit value." });
  
      const where = {};
  
      if (name) {
        where.name = { contains: name, mode: "insensitive" };
      }

      if (type && ["automatic", "one-time"].includes(type)) {
        where.type = type === "one-time" ? "oneTime" : type;
      }
  
      const now = new Date();
  
      if (["manager", "superuser"].includes(user.role)) {
        if (started !== undefined && ended !== undefined) {
          return res.status(400).json({ error: "Cannot filter" });
        }
        if (started === "true") where.startTime = { lte: now };
        if (started === "false") where.startTime = { gt: now };
        if (ended === "true") where.endTime = { lte: now };
        if (ended === "false") where.endTime = { gt: now };
      } else {
        where.startTime = { lte: now };
        where.endTime = { gt: now };
        where.users = {
          none: {
            userId: user.id,
            redeemed: true
          }
        };
      }
  
      const totalCount = await prisma.promotion.count({ where });
  
      const promotions = await prisma.promotion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" }
      });
  
      const results = promotions.map(p => {
        const base = {
          id: p.id,
          name: p.name,
          type: p.type === "oneTime" ? "one-time" : p.type,
          endTime: p.endTime.toISOString(),
          minSpending: p.minSpending,
          rate: p.rate,
          points: p.points
        };
  
        if (["manager", "superuser"].includes(user.role)) {
          return {
            ...base,
            startTime: p.startTime.toISOString()
          };
        }
  
        return base;
      });
  
      return res.status(200).json({ count: totalCount, results });
    } catch (err) {
      console.error("Error retrieving promotions:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  app.get('/promotions/:promotionId', authenticate, authorize(["regular", "cashier", "manager", "superuser"]), async (req, res) => {
    try {
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId) || promotionId <= 0) {
            return res.status(400).json({ error: "Invalid promotion ID." });
        }

        const userRole = req.user.role;
        const now = new Date();

        const baseSelect = {
            id: true,
            name: true,
            description: true,
            type: true,
            startTime: true,
            endTime: true,
            minSpending: true,
            rate: true,
            points: true,
        };

        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId },
            select: baseSelect
        });

        if (!promotion) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        const isManagerOrHigher = userRole === "manager" || userRole === "superuser";

        const isActive = promotion.startTime <= now && promotion.endTime >= now;

        if (!isManagerOrHigher && !isActive) {
            return res.status(404).json({ error: "Promotion not currently active." });
        }

        const response = {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending || 0,
            rate: promotion.rate || 0,
            points: promotion.points || 0
        };

        if (isManagerOrHigher) {
            response.startTime = promotion.startTime.toISOString();
        }

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error retrieving promotion:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.patch('/promotions/:promotionId', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId) || promotionId <= 0) {
            return res.status(400).json({ error: "Invalid promotion ID." });
        }

        const {
            name,
            description,
            type,
            startTime,
            endTime,
            minSpending,
            rate,
            points
        } = req.body;

        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!promotion) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        const now = new Date();
        const originalStart = promotion.startTime;
        const originalEnd = promotion.endTime;
        const afterStart = now >= originalStart;
        const afterEnd = now > originalEnd;

        const updateData = {};

        if (name !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update name" });
            }
            updateData.name = name;
        }

        if (description !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update description" });
            }
            updateData.description = description;
        }

        if (type !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update type" });
            }
            if (!["automatic", "one-time"].includes(type)) {
                return res.status(400).json({ error: "Invalid promotion type." });
            }
            updateData.type = type === "one-time" ? "oneTime" : "automatic";
        }

        if (startTime !== undefined) {
            const newStart = new Date(startTime);
            if (isNaN(newStart.getTime()) || newStart < now) {
                return res.status(400).json({ error: "Invalid or past startTime." });
            }
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update startTime" });
            }
            updateData.startTime = newStart;
        }

        if (endTime !== undefined) {
            const newEnd = new Date(endTime);
            if (isNaN(newEnd.getTime()) || newEnd <= (updateData.startTime || originalStart)) {
                return res.status(400).json({ error: "endTime must be after startTime." });
            }
            if (afterEnd) {
                return res.status(400).json({ error: "Cannot update endTime" });
            }
            updateData.endTime = newEnd;
        }

        if (minSpending !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update minSpending" });
            }
            const ms = parseFloat(minSpending);
            if (isNaN(ms) || ms <= 0) {
                return res.status(400).json({ error: "minSpending must be a positive number." });
            }
            updateData.minSpending = ms;
        }

        if (rate !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update rate" });
            }
            const r = parseFloat(rate);
            if (isNaN(r) || r <= 0) {
                return res.status(400).json({ error: "rate must be a positive number." });
            }
            updateData.rate = r;
        }

        if (points !== undefined) {
            if (afterStart) {
                return res.status(400).json({ error: "Cannot update points" });
            }
            const p = parseInt(points, 10);
            if (isNaN(p) || p < 0) {
                return res.status(400).json({ error: "points must be a positive integer or 0." });
            }
            updateData.points = p;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const updated = await prisma.promotion.update({
            where: { id: promotionId },
            data: updateData
        });

        const response = {
            id: updated.id,
            name: updated.name,
            type: updated.type
        };

        for (const key of Object.keys(updateData)) {
            if (key === "startTime" || key === "endTime") {
                response[key] = updated[key].toISOString();
            } else {
                response[key] = updated[key];
            }
        }

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error updating promotion:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/promotions/:promotionId', authenticate, authorize(["manager", "superuser"]), async (req, res) => {
    try {
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId) || promotionId <= 0) {
            return res.status(400).json({ error: "Invalid promotion ID." });
        }

        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!promotion) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        const now = new Date();
        if (promotion.startTime <= now) {
            return res.status(403).json({ error: "Cannot delete promotion" });
        }

        await prisma.promotion.delete({
            where: { id: promotionId }
        });

        return res.status(204).send();

    } catch (err) {
        console.error("Error deleting promotion:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



  
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`Cannot start server: ${err.message}`);
    process.exit(1);
});
