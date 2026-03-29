import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.focusArea.deleteMany();
  await prisma.teamMember.deleteMany();

  // Create team members
  const alice = await prisma.teamMember.create({
    data: {
      name: "Alice Chen",
      email: "alice@company.com",
      role: "CEO & Founder",
    },
  });

  const bob = await prisma.teamMember.create({
    data: {
      name: "Bob Martinez",
      email: "bob@company.com",
      role: "Head of Product",
    },
  });

  const carol = await prisma.teamMember.create({
    data: {
      name: "Carol Johnson",
      email: "carol@company.com",
      role: "Engineering Lead",
    },
  });

  const dave = await prisma.teamMember.create({
    data: {
      name: "Dave Kim",
      email: "dave@company.com",
      role: "Marketing Manager",
    },
  });

  // Create Focus Areas
  const productGrowth = await prisma.focusArea.create({
    data: {
      title: "Product Growth",
      description:
        "Expand our product capabilities and grow the user base through feature development and improved UX.",
      color: "#2563eb",
      sortOrder: 1,
    },
  });

  const engExcellence = await prisma.focusArea.create({
    data: {
      title: "Engineering Excellence",
      description:
        "Improve code quality, development velocity, and system reliability.",
      color: "#7c3aed",
      sortOrder: 2,
    },
  });

  const customerSuccess = await prisma.focusArea.create({
    data: {
      title: "Customer Success",
      description:
        "Increase customer satisfaction, reduce churn, and build lasting relationships.",
      color: "#16a34a",
      sortOrder: 3,
    },
  });

  // Create sub-focus area
  await prisma.focusArea.create({
    data: {
      title: "Customer Retention",
      description: "Focus on keeping existing customers happy and engaged.",
      color: "#059669",
      parentId: customerSuccess.id,
      sortOrder: 1,
    },
  });

  // Assign team members to focus areas
  await prisma.assignment.createMany({
    data: [
      {
        teamMemberId: alice.id,
        focusAreaId: productGrowth.id,
        role: "lead",
      },
      {
        teamMemberId: bob.id,
        focusAreaId: productGrowth.id,
        role: "contributor",
      },
      {
        teamMemberId: carol.id,
        focusAreaId: engExcellence.id,
        role: "lead",
      },
      {
        teamMemberId: dave.id,
        focusAreaId: customerSuccess.id,
        role: "lead",
      },
      {
        teamMemberId: bob.id,
        focusAreaId: customerSuccess.id,
        role: "contributor",
      },
    ],
  });

  // --- Product Growth Goals ---
  const pgObj1 = await prisma.goal.create({
    data: {
      title: "Increase monthly active users by 50%",
      goalType: "objective",
      status: "on_track",
      targetValue: 100,
      currentValue: 35,
      unit: "%",
      metricType: "percentage",
      focusAreaId: productGrowth.id,
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        title: "Launch 3 new features this quarter",
        goalType: "key_result",
        status: "on_track",
        targetValue: 3,
        currentValue: 1,
        unit: " features",
        metricType: "number",
        focusAreaId: productGrowth.id,
        parentGoalId: pgObj1.id,
      },
      {
        title: "Achieve 4.5 star app store rating",
        goalType: "key_result",
        status: "at_risk",
        targetValue: 4.5,
        currentValue: 4.1,
        startValue: 3.8,
        unit: " stars",
        metricType: "number",
        focusAreaId: productGrowth.id,
        parentGoalId: pgObj1.id,
      },
    ],
  });

  const pgObj2 = await prisma.goal.create({
    data: {
      title: "Improve user onboarding completion rate",
      goalType: "objective",
      status: "on_track",
      targetValue: 80,
      currentValue: 55,
      unit: "%",
      metricType: "percentage",
      focusAreaId: productGrowth.id,
    },
  });

  await prisma.goal.create({
    data: {
      title: "Reduce onboarding time to under 5 minutes",
      goalType: "key_result",
      status: "on_track",
      targetValue: 5,
      currentValue: 7,
      startValue: 12,
      unit: " min",
      metricType: "number",
      focusAreaId: productGrowth.id,
      parentGoalId: pgObj2.id,
    },
  });

  // --- Engineering Excellence Goals ---
  const eeObj1 = await prisma.goal.create({
    data: {
      title: "Reduce production incidents by 60%",
      goalType: "objective",
      status: "on_track",
      targetValue: 60,
      currentValue: 40,
      unit: "%",
      metricType: "percentage",
      focusAreaId: engExcellence.id,
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        title: "Achieve 95% test coverage on core modules",
        goalType: "key_result",
        status: "on_track",
        targetValue: 95,
        currentValue: 78,
        startValue: 60,
        unit: "%",
        metricType: "percentage",
        focusAreaId: engExcellence.id,
        parentGoalId: eeObj1.id,
      },
      {
        title: "Implement automated deployment pipeline",
        goalType: "key_result",
        status: "behind",
        targetValue: 100,
        currentValue: 30,
        unit: "%",
        metricType: "percentage",
        focusAreaId: engExcellence.id,
        parentGoalId: eeObj1.id,
      },
    ],
  });

  // --- Customer Success Goals ---
  const csObj1 = await prisma.goal.create({
    data: {
      title: "Increase NPS score to 70+",
      goalType: "objective",
      status: "at_risk",
      targetValue: 70,
      currentValue: 52,
      startValue: 45,
      unit: "",
      metricType: "number",
      focusAreaId: customerSuccess.id,
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        title: "Reduce average support response time to 2 hours",
        goalType: "key_result",
        status: "on_track",
        targetValue: 2,
        currentValue: 4,
        startValue: 8,
        unit: " hrs",
        metricType: "number",
        focusAreaId: customerSuccess.id,
        parentGoalId: csObj1.id,
      },
      {
        title: "Achieve 90% customer satisfaction on support tickets",
        goalType: "key_result",
        status: "at_risk",
        targetValue: 90,
        currentValue: 78,
        startValue: 70,
        unit: "%",
        metricType: "percentage",
        focusAreaId: customerSuccess.id,
        parentGoalId: csObj1.id,
      },
    ],
  });

  // --- Initiatives and Tasks ---

  // Product Growth initiatives
  const init1 = await prisma.initiative.create({
    data: {
      title: "Redesign Onboarding Flow",
      description:
        "Simplify the new user onboarding experience with guided tutorials and progress indicators.",
      status: "in_progress",
      priority: "high",
      focusAreaId: productGrowth.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "User research interviews (10 users)",
        status: "done",
        priority: "high",
        initiativeId: init1.id,
        assigneeId: bob.id,
      },
      {
        title: "Design new onboarding wireframes",
        status: "done",
        priority: "high",
        initiativeId: init1.id,
        assigneeId: bob.id,
      },
      {
        title: "Implement step-by-step wizard component",
        status: "in_progress",
        priority: "high",
        initiativeId: init1.id,
        assigneeId: carol.id,
      },
      {
        title: "Add progress tracking to onboarding",
        status: "todo",
        priority: "medium",
        initiativeId: init1.id,
        assigneeId: carol.id,
      },
      {
        title: "A/B test new vs old onboarding",
        status: "todo",
        priority: "medium",
        initiativeId: init1.id,
      },
    ],
  });

  const init2 = await prisma.initiative.create({
    data: {
      title: "Mobile App Launch",
      description:
        "Build and launch a mobile companion app for iOS and Android.",
      status: "planned",
      priority: "critical",
      focusAreaId: productGrowth.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Define mobile app feature set",
        status: "done",
        priority: "critical",
        initiativeId: init2.id,
        assigneeId: alice.id,
      },
      {
        title: "Set up React Native project",
        status: "todo",
        priority: "high",
        initiativeId: init2.id,
        assigneeId: carol.id,
      },
      {
        title: "Design mobile UI kit",
        status: "todo",
        priority: "high",
        initiativeId: init2.id,
        assigneeId: bob.id,
      },
      {
        title: "Implement authentication flow",
        status: "todo",
        priority: "high",
        initiativeId: init2.id,
      },
    ],
  });

  // Engineering Excellence initiatives
  const init3 = await prisma.initiative.create({
    data: {
      title: "CI/CD Pipeline Modernization",
      description:
        "Migrate from manual deployments to fully automated CI/CD pipeline.",
      status: "in_progress",
      priority: "high",
      focusAreaId: engExcellence.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Evaluate CI/CD platforms (GitHub Actions vs GitLab CI)",
        status: "done",
        priority: "high",
        initiativeId: init3.id,
        assigneeId: carol.id,
      },
      {
        title: "Set up staging environment",
        status: "done",
        priority: "high",
        initiativeId: init3.id,
        assigneeId: carol.id,
      },
      {
        title: "Configure automated testing in pipeline",
        status: "in_progress",
        priority: "high",
        initiativeId: init3.id,
        assigneeId: carol.id,
      },
      {
        title: "Add deployment approval gates",
        status: "todo",
        priority: "medium",
        initiativeId: init3.id,
      },
      {
        title: "Document deployment runbook",
        status: "todo",
        priority: "low",
        initiativeId: init3.id,
      },
    ],
  });

  const init4 = await prisma.initiative.create({
    data: {
      title: "Test Coverage Improvement",
      description:
        "Increase test coverage across all core modules to 95%.",
      status: "in_progress",
      priority: "medium",
      focusAreaId: engExcellence.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Audit current test coverage per module",
        status: "done",
        priority: "medium",
        initiativeId: init4.id,
        assigneeId: carol.id,
      },
      {
        title: "Write integration tests for API layer",
        status: "in_progress",
        priority: "high",
        initiativeId: init4.id,
        assigneeId: carol.id,
      },
      {
        title: "Add unit tests for payment module",
        status: "todo",
        priority: "high",
        initiativeId: init4.id,
      },
    ],
  });

  // Customer Success initiatives
  const init5 = await prisma.initiative.create({
    data: {
      title: "Knowledge Base & Self-Service Portal",
      description:
        "Build a comprehensive knowledge base to reduce support ticket volume.",
      status: "in_progress",
      priority: "high",
      focusAreaId: customerSuccess.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Identify top 50 support questions",
        status: "done",
        priority: "high",
        initiativeId: init5.id,
        assigneeId: dave.id,
      },
      {
        title: "Write help articles for top 20 questions",
        status: "done",
        priority: "high",
        initiativeId: init5.id,
        assigneeId: dave.id,
      },
      {
        title: "Design and build knowledge base UI",
        status: "in_progress",
        priority: "high",
        initiativeId: init5.id,
        assigneeId: bob.id,
      },
      {
        title: "Add search functionality",
        status: "todo",
        priority: "medium",
        initiativeId: init5.id,
      },
      {
        title: "Integrate with in-app help widget",
        status: "todo",
        priority: "medium",
        initiativeId: init5.id,
      },
    ],
  });

  const init6 = await prisma.initiative.create({
    data: {
      title: "Customer Feedback Loop",
      description:
        "Implement systematic customer feedback collection and action process.",
      status: "planned",
      priority: "medium",
      focusAreaId: customerSuccess.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Set up NPS survey tool",
        status: "done",
        priority: "medium",
        initiativeId: init6.id,
        assigneeId: dave.id,
      },
      {
        title: "Design quarterly feedback review process",
        status: "todo",
        priority: "medium",
        initiativeId: init6.id,
        assigneeId: dave.id,
      },
      {
        title: "Create customer advisory board",
        status: "todo",
        priority: "low",
        initiativeId: init6.id,
        assigneeId: alice.id,
      },
    ],
  });

  console.log("Seed data created successfully!");
  console.log(`  - 4 team members`);
  console.log(`  - 4 focus areas (3 top-level + 1 child)`);
  console.log(`  - 5 objectives with key results`);
  console.log(`  - 6 initiatives with tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
