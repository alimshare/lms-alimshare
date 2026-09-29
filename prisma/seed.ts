import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const demoPassword = process.env.SEED_DEMO_PASSWORD ?? 'AlimShareDev123!'

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.')
  }

  const password = await bcrypt.hash(demoPassword, 12)
  const verifiedAt = new Date()

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alimshare.local' },
    update: {
      password,
      firstName: 'Amina',
      lastName: 'Admin',
      name: 'Amina Admin',
      role: 'administrator',
      isActive: true,
    },
    create: {
      email: 'admin@alimshare.local',
      password,
      firstName: 'Amina',
      lastName: 'Admin',
      name: 'Amina Admin',
      role: 'administrator',
      emailVerified: verifiedAt,
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@alimshare.local' },
    update: {
      password,
      firstName: 'Samir',
      lastName: 'Hassan',
      name: 'Samir Hassan',
      role: 'teacher',
      isActive: true,
    },
    create: {
      email: 'teacher@alimshare.local',
      password,
      firstName: 'Samir',
      lastName: 'Hassan',
      name: 'Samir Hassan',
      role: 'teacher',
      emailVerified: verifiedAt,
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@alimshare.local' },
    update: {
      password,
      firstName: 'Noor',
      lastName: 'Ali',
      name: 'Noor Ali',
      role: 'student',
      isActive: true,
    },
    create: {
      email: 'student@alimshare.local',
      password,
      firstName: 'Noor',
      lastName: 'Ali',
      name: 'Noor Ali',
      role: 'student',
      emailVerified: verifiedAt,
    },
  })

  const category = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: { name: 'Web Development' },
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Foundations and practical skills for building websites.',
      icon: 'Code2',
    },
  })

  const course = await prisma.course.upsert({
    where: { slug: 'web-development-fundamentals' },
    update: {
      title: 'Web Development Fundamentals',
      teacherId: teacher.id,
      categoryId: category.id,
      status: 'published',
      isPublished: true,
      totalLessons: 2,
      totalDuration: 35,
      publishedAt: verifiedAt,
    },
    create: {
      title: 'Web Development Fundamentals',
      slug: 'web-development-fundamentals',
      description:
        'Learn the building blocks of the web and create your first accessible page.',
      level: 'beginner',
      status: 'published',
      whatYouLearn: [
        'Explain how HTML and CSS work together',
        'Build a simple, accessible web page',
      ],
      requirements: ['No prior experience required'],
      teacherId: teacher.id,
      categoryId: category.id,
      isPublished: true,
      totalLessons: 2,
      totalDuration: 35,
      publishedAt: verifiedAt,
    },
  })

  const firstSection = await prisma.courseSection.upsert({
    where: { id: 'b4b5a770-8c90-4b9b-a000-000000000001' },
    update: {
      title: 'How the Web Works',
      description: 'Understand the parts of a web page and how browsers render them.',
      order: 1,
      courseId: course.id,
    },
    create: {
      id: 'b4b5a770-8c90-4b9b-a000-000000000001',
      title: 'How the Web Works',
      description: 'Understand the parts of a web page and how browsers render them.',
      order: 1,
      courseId: course.id,
    },
  })

  const secondSection = await prisma.courseSection.upsert({
    where: { id: 'b4b5a770-8c90-4b9b-a000-000000000002' },
    update: {
      title: 'Your First Page',
      description: 'Structure content with HTML and style it with CSS.',
      order: 2,
      courseId: course.id,
    },
    create: {
      id: 'b4b5a770-8c90-4b9b-a000-000000000002',
      title: 'Your First Page',
      description: 'Structure content with HTML and style it with CSS.',
      order: 2,
      courseId: course.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'b4b5a770-8c90-4b9b-a000-000000000011' },
    update: {
      title: 'How a Web Page Loads',
      content: 'Browsers request documents from servers and render HTML, CSS, and JavaScript.',
      duration: 15,
      order: 1,
      type: 'text',
      isPreview: true,
      sectionId: firstSection.id,
    },
    create: {
      id: 'b4b5a770-8c90-4b9b-a000-000000000011',
      title: 'How a Web Page Loads',
      content: 'Browsers request documents from servers and render HTML, CSS, and JavaScript.',
      duration: 15,
      order: 1,
      type: 'text',
      isPreview: true,
      sectionId: firstSection.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'b4b5a770-8c90-4b9b-a000-000000000012' },
    update: {
      title: 'Write Your First HTML Page',
      content: 'Use headings, paragraphs, and links to give a document meaningful structure.',
      duration: 20,
      order: 1,
      type: 'text',
      isPreview: false,
      sectionId: secondSection.id,
    },
    create: {
      id: 'b4b5a770-8c90-4b9b-a000-000000000012',
      title: 'Write Your First HTML Page',
      content: 'Use headings, paragraphs, and links to give a document meaningful structure.',
      duration: 20,
      order: 1,
      type: 'text',
      isPreview: false,
      sectionId: secondSection.id,
    },
  })

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course.id,
      },
    },
    update: { status: 'active' },
    create: {
      studentId: student.id,
      courseId: course.id,
      status: 'active',
    },
  })

  console.info('Seeded demo accounts:')
  console.info('  admin@alimshare.local')
  console.info('  teacher@alimshare.local')
  console.info('  student@alimshare.local')
  console.info(
    process.env.SEED_DEMO_PASSWORD
      ? 'Demo account passwords are set from SEED_DEMO_PASSWORD.'
      : 'Demo password: AlimShareDev123!',
  )
  console.info('Seeded Web Development Fundamentals with two lessons and one enrollment.')
  console.info(`Admin account: ${admin.email}`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })