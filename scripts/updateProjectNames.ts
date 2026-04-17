import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating all project names to add "建设项目" suffix...\n')

  const projects = await prisma.project.findMany()

  for (const project of projects) {
    if (!project.name.endsWith('建设项目')) {
      const newName = `${project.name}建设项目`
      await prisma.project.update({
        where: { id: project.id },
        data: { name: newName },
      })
      console.log(`  ✓ "${project.name}" → "${newName}"`)
    } else {
      console.log(`  - "${project.name}" (already has suffix, skipped)`)
    }
  }

  console.log(`\n✅ Done! Updated ${projects.length} projects.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
