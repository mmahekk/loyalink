#!/usr/bin/env node
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();

  try {
    const [,, utorid, email, password] = process.argv;
    if (!utorid || !email || !password) {
      console.error("Usage: node prisma/createsu.js <utorid> <email> <password>");
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    const newSuperuser = await prisma.user.create({
      data: {
        utorid,
        email,
        password: hashed,
        username: utorid,
        role: 'superuser',  
        verified: true,
      },
    });

    console.log(`Superuser created successfully: ${newSuperuser.utorid}`);
  } catch (err) {
    console.error("Error creating superuser:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
