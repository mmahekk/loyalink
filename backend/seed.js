/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';
const { PrismaClient } = require('@prisma/client')
const { Decimal } = require('@prisma/client/runtime/library')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Test1234!', 10)

  const roles = ['regular', 'cashier', 'manager', 'superuser']

  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          username: `user${i + 1}`,
          utorid: `user${i + 1}`.padEnd(8, 'x'),
          email: `user${i + 1}@mail.utoronto.ca`,
          password: hashedPassword,
          role: roles[i] || 'regular',
          verified: true,
          suspicious: false,
          points: 1000,
          name: `User ${i + 1}`,
          birthday: new Date('2000-01-01'),
          createdAt: new Date('2025-02-22'),
          lastLogin: new Date('2025-02-23')
        }
      })
    )
  )

  const promotions = await Promise.all(
    ['Buy a Pepsi', 'Spring Bonus', 'Midterm Madness', 'Exam Relief', 'Free Coffee Bonus'].map((name, i) =>
      prisma.promotion.create({
        data: {
          name,
          description: `${name} promo description`,
          type: i % 2 === 0 ? 'automatic' : 'oneTime',
          startTime: new Date('2025-04-10T09:00:00Z'),
          endTime: new Date('2025-06-10T17:00:00Z'),
          minSpending: new Decimal(20.0),
          rate: i % 2 === 0 ? 0.05 : null,
          points: i % 2 === 1 ? 20 : 0
        }
      })
    )
  )

  const events = await Promise.all(
    ['Orientation Day', 'Hackathon', 'Career Fair', 'Wellness Day', 'Game Night'].map((name, i) =>
      prisma.event.create({
        data: {
          name,
          description: `${name} event`,
          location: `BA ${2000 + i}`,
          startTime: new Date(`2025-05-${10 + i}T09:00:00Z`),
          endTime: new Date(`2025-05-${10 + i}T17:00:00Z`),
          capacity: 100 + i * 10,
          pointsRemain: 500,
          pointsAwarded: 0,
          published: true
        }
      })
    )
  )

  for (const event of events) {
    await prisma.eventOrganizer.createMany({
      data: [
        { eventId: event.id, userId: users[0].id },
        { eventId: event.id, userId: users[1].id }
      ]
    })

    for (let i = 2; i < 7; i++) {
      await prisma.eventGuest.create({
        data: {
          eventId: event.id,
          userId: users[i % users.length].id
        }
      })
    }
  }

  const transactionTypes = ['purchase', 'adjustment', 'redemption', 'transfer', 'event']
  let txId = 1
  for (let i = 0; i < 30; i++) {
    const type = transactionTypes[i % transactionTypes.length]
    const user = users[i % users.length]
    const creator = users[(i + 1) % users.length]
    await prisma.transaction.create({
      data: {
        id: txId++,
        type,
        userId: user.id,
        createdById: creator.id,
        amount: type !== 'purchase' ? (i % 2 === 0 ? 50 : -40) : null,
        spent: type === 'purchase' ? new Decimal('25.50') : null,
        remark: `Auto-generated ${type}`,
        suspicious: false,
        processed: type === 'redemption' ? false : undefined,
        relatedId:
          type === 'adjustment' || type === 'redemption' || type === 'event'
            ? 1
            : type === 'transfer'
            ? users[(i + 2) % users.length].id
            : null
      }
    })
  }

  console.log('Seed complete with organizers and guests added.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
