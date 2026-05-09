import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { services } from "../src/data/services";
import { tariffs } from "../src/data/tariffs";
import { news } from "../src/data/news";
import { cases } from "../src/data/cases";
import { coveragePoints } from "../src/data/coverage";

const prisma = new PrismaClient();

const STATUS_COMPONENTS: {
  slug: string;
  name: string;
  group: string;
  description?: string;
  order: number;
}[] = [
  { slug: "core-network", name: "Магистральная сеть", group: "Сеть", order: 0 },
  {
    slug: "internet-access",
    name: "Доступ в интернет",
    group: "Сеть",
    description: "Шлюзы IP-транзита, BGP-аплинки",
    order: 1,
  },
  {
    slug: "l2vpn",
    name: "L2-VPN между офисами",
    group: "Корпоративные услуги",
    order: 2,
  },
  {
    slug: "datacenter",
    name: "ЦОД (хостинг и colocation)",
    group: "ЦОД",
    order: 3,
  },
  {
    slug: "client-portal",
    name: "Личный кабинет",
    group: "Клиентские сервисы",
    order: 4,
  },
  {
    slug: "billing-api",
    name: "Биллинг и API",
    group: "Клиентские сервисы",
    order: 5,
  },
];

async function main() {
  console.log("→ Seeding services…");
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        category: s.category,
        shortText: s.shortText,
        description: s.description,
        iconKey: s.iconKey,
        features: JSON.stringify(s.features),
        order: s.order,
      },
      create: {
        slug: s.slug,
        title: s.title,
        category: s.category,
        shortText: s.shortText,
        description: s.description,
        iconKey: s.iconKey,
        features: JSON.stringify(s.features),
        order: s.order,
        slaUptime: 99.7,
        slaResponseHours: 4,
        slaResolveHours: 24,
      },
    });
  }

  console.log("→ Seeding tariffs…");
  for (const t of tariffs) {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: t.serviceSlug } });
    await prisma.tariff.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        speedMbps: t.speedMbps,
        priceRub: t.priceRub,
        perks: JSON.stringify(t.perks),
        highlight: t.highlight,
        order: t.order,
        serviceId: service.id,
      },
      create: {
        slug: t.slug,
        title: t.title,
        speedMbps: t.speedMbps,
        priceRub: t.priceRub,
        perks: JSON.stringify(t.perks),
        highlight: t.highlight,
        order: t.order,
        serviceId: service.id,
      },
    });
  }

  console.log("→ Seeding news…");
  for (const n of news) {
    await prisma.newsItem.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        excerpt: n.excerpt,
        body: n.body,
        publishedAt: new Date(n.publishedAt),
        cover: n.cover,
      },
      create: {
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        body: n.body,
        publishedAt: new Date(n.publishedAt),
        cover: n.cover,
      },
    });
  }

  console.log("→ Seeding cases…");
  for (const c of cases) {
    await prisma.case.upsert({
      where: { slug: c.slug },
      update: {
        clientName: c.clientName,
        industry: c.industry,
        segment: c.segment,
        summary: c.summary,
        challenge: c.challenge,
        solution: c.solution,
        result: c.result,
        techStack: JSON.stringify(c.techStack),
        metrics: JSON.stringify(c.metrics),
        publishedAt: new Date(c.publishedAt),
        order: c.order,
        cover: c.cover ?? null,
        clientLogoUrl: c.clientLogoUrl ?? null,
        isPublished: true,
      },
      create: {
        slug: c.slug,
        clientName: c.clientName,
        industry: c.industry,
        segment: c.segment,
        summary: c.summary,
        challenge: c.challenge,
        solution: c.solution,
        result: c.result,
        techStack: JSON.stringify(c.techStack),
        metrics: JSON.stringify(c.metrics),
        publishedAt: new Date(c.publishedAt),
        order: c.order,
        cover: c.cover ?? null,
        clientLogoUrl: c.clientLogoUrl ?? null,
      },
    });
  }

  console.log("→ Seeding coverage points…");
  await prisma.coveragePoint.deleteMany({});
  for (const p of coveragePoints) {
    await prisma.coveragePoint.create({
      data: {
        type: p.type,
        title: p.title ?? null,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        geojson: p.geojson ? JSON.stringify(p.geojson) : null,
        metadata: p.metadata ? JSON.stringify(p.metadata) : null,
      },
    });
  }

  console.log("→ Seeding status components…");
  for (const c of STATUS_COMPONENTS) {
    await prisma.statusComponent.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        group: c.group,
        order: c.order,
        description: c.description ?? null,
      },
      create: {
        slug: c.slug,
        name: c.name,
        group: c.group,
        description: c.description ?? null,
        order: c.order,
        currentStatus: "operational",
      },
    });
  }

  console.log("→ Seeding demo user (B2C legacy)…");
  const passwordHash = await bcrypt.hash("Demo12345!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@rutega.ru" },
    update: { fullName: "Иван Демидов", phone: "+7 (999) 123-45-67", passwordHash },
    create: {
      email: "demo@rutega.ru",
      fullName: "Иван Демидов",
      phone: "+7 (999) 123-45-67",
      passwordHash,
    },
  });

  console.log("→ Seeding admin user…");
  const adminPasswordHash = await bcrypt.hash("karim22333", 12);
  await prisma.user.deleteMany({ where: { username: "admin2222" } });
  const adminUser = await prisma.user.upsert({
    where: { email: "karim2222@rutega.local" },
    update: {
      fullName: "Администратор",
      username: "karim2222",
      role: "admin",
      passwordHash: adminPasswordHash,
    },
    create: {
      email: "karim2222@rutega.local",
      username: "karim2222",
      fullName: "Администратор",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  console.log("→ Seeding B2B contacts (director/accountant/tech)…");
  const directorHash = await bcrypt.hash("Director1!", 12);
  const accountantHash = await bcrypt.hash("Accountant1!", 12);
  const techHash = await bcrypt.hash("TechSpec1!", 12);

  const director = await prisma.user.upsert({
    where: { email: "director@horns-hooves.ru" },
    update: { fullName: "Семён Авдеев", phone: "+7 (495) 555-01-01", passwordHash: directorHash },
    create: {
      email: "director@horns-hooves.ru",
      fullName: "Семён Авдеев",
      phone: "+7 (495) 555-01-01",
      passwordHash: directorHash,
    },
  });
  const accountant = await prisma.user.upsert({
    where: { email: "buh@horns-hooves.ru" },
    update: { fullName: "Ольга Прохорова", phone: "+7 (495) 555-01-02", passwordHash: accountantHash },
    create: {
      email: "buh@horns-hooves.ru",
      fullName: "Ольга Прохорова",
      phone: "+7 (495) 555-01-02",
      passwordHash: accountantHash,
    },
  });
  const tech = await prisma.user.upsert({
    where: { email: "tech@horns-hooves.ru" },
    update: { fullName: "Михаил Орлов", phone: "+7 (495) 555-01-03", passwordHash: techHash },
    create: {
      email: "tech@horns-hooves.ru",
      fullName: "Михаил Орлов",
      phone: "+7 (495) 555-01-03",
      passwordHash: techHash,
    },
  });

  console.log("→ Seeding manager users…");
  const managerHash = await bcrypt.hash("Manager1!", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@rutega.local" },
    update: {
      fullName: "Анна Гузеева",
      phone: "+7 (495) 600-00-12",
      role: "manager",
      passwordHash: managerHash,
    },
    create: {
      email: "manager@rutega.local",
      fullName: "Анна Гузеева",
      phone: "+7 (495) 600-00-12",
      role: "manager",
      passwordHash: managerHash,
    },
  });

  console.log("→ Seeding organizations…");
  const horns = await prisma.organization.upsert({
    where: { inn: "7707083893" },
    update: {
      legalName: 'ООО «Рога и Копыта»',
      shortName: 'Рога и Копыта',
      kpp: "770701001",
      ogrn: "1027700123456",
      legalAddress: "Москва, Берсеневская наб., 6, стр. 3",
      contactEmail: "office@horns-hooves.ru",
      contactPhone: "+7 (495) 555-01-01",
      accountManagerId: manager.id,
    },
    create: {
      inn: "7707083893",
      kpp: "770701001",
      ogrn: "1027700123456",
      legalName: 'ООО «Рога и Копыта»',
      shortName: 'Рога и Копыта',
      legalAddress: "Москва, Берсеневская наб., 6, стр. 3",
      contactEmail: "office@horns-hooves.ru",
      contactPhone: "+7 (495) 555-01-01",
      bankDetails: JSON.stringify({
        bank: "АО «Тинькофф Банк»",
        bik: "044525974",
        account: "40702810400000999812",
        corrAccount: "30101810145250000974",
      }),
      accountManagerId: manager.id,
    },
  });

  console.log("→ Seeding sites…");
  await prisma.site.deleteMany({ where: { organizationId: horns.id } });
  const [siteHQ, siteWarehouse] = await Promise.all([
    prisma.site.create({
      data: {
        organizationId: horns.id,
        title: "Головной офис",
        address: "Москва, Берсеневская наб., 6, стр. 3",
        lat: 55.745,
        lng: 37.605,
        status: "active",
      },
    }),
    prisma.site.create({
      data: {
        organizationId: horns.id,
        title: "Склад «Юг»",
        address: "Московская обл., Подольск, Промышленная 12",
        lat: 55.43,
        lng: 37.55,
        status: "active",
      },
    }),
  ]);

  console.log("→ Seeding org members…");
  for (const [user, role, position] of [
    [director, "director", "Генеральный директор"],
    [accountant, "accountant", "Главный бухгалтер"],
    [tech, "tech", "Системный администратор"],
  ] as const) {
    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: horns.id, userId: user.id } },
      update: { role, position, acceptedAt: new Date() },
      create: {
        organizationId: horns.id,
        userId: user.id,
        role,
        position,
        acceptedAt: new Date(),
      },
    });
  }

  console.log("→ Seeding org services…");
  const homeFast = await prisma.tariff.findUniqueOrThrow({ where: { slug: "home-fast" } });
  const tvPremium = await prisma.tariff.findUniqueOrThrow({ where: { slug: "tv-premium" } });

  // Demo user keeps a B2C-style stack
  await prisma.userService.deleteMany({ where: { userId: demoUser.id } });
  await prisma.userService.createMany({
    data: [
      {
        userId: demoUser.id,
        serviceId: homeFast.serviceId,
        tariffSlug: homeFast.slug,
        status: "active",
      },
      {
        userId: demoUser.id,
        serviceId: tvPremium.serviceId,
        tariffSlug: tvPremium.slug,
        status: "active",
      },
    ],
  });

  await prisma.bill.deleteMany({ where: { userId: demoUser.id } });
  await prisma.bill.createMany({
    data: [
      {
        userId: demoUser.id,
        amount: homeFast.priceRub + tvPremium.priceRub,
        status: "due",
        period: "2026-05",
        paidAt: null,
      },
      {
        userId: demoUser.id,
        amount: homeFast.priceRub + tvPremium.priceRub,
        status: "paid",
        period: "2026-04",
        paidAt: new Date("2026-04-05T10:30:00Z"),
      },
    ],
  });

  // B2B services for the org director (he holds them on his account)
  const businessTariff = await prisma.tariff.findFirst({
    where: { service: { category: "business" } },
    orderBy: { priceRub: "desc" },
  });
  if (businessTariff) {
    await prisma.userService.deleteMany({ where: { userId: director.id } });
    await prisma.userService.createMany({
      data: [
        {
          userId: director.id,
          serviceId: businessTariff.serviceId,
          tariffSlug: businessTariff.slug,
          siteId: siteHQ.id,
          status: "active",
        },
        {
          userId: director.id,
          serviceId: businessTariff.serviceId,
          tariffSlug: businessTariff.slug,
          siteId: siteWarehouse.id,
          status: "active",
        },
      ],
    });
  }

  console.log("→ Seeding billing account + invoices…");
  await prisma.invoice.deleteMany({ where: { account: { organizationId: horns.id } } });
  await prisma.charge.deleteMany({ where: { account: { organizationId: horns.id } } });
  await prisma.payment.deleteMany({ where: { account: { organizationId: horns.id } } });

  const account = await prisma.account.upsert({
    where: { organizationId: horns.id },
    update: { balanceKop: -489000, creditLimitKop: 200000 },
    create: {
      organizationId: horns.id,
      number: "ЛС-40001",
      balanceKop: -489000,
      creditLimitKop: 200000,
      billingMode: "postpay",
    },
  });

  // April invoice — paid
  const aprInvoice = await prisma.invoice.create({
    data: {
      number: "СЧ-2026-000001",
      accountId: account.id,
      period: "2026-04",
      totalKop: 1245000,
      vatKop: Math.round((1245000 * 20) / 120),
      status: "paid",
      issuedAt: new Date("2026-04-01T09:00:00Z"),
      dueAt: new Date("2026-04-11T09:00:00Z"),
      paidAt: new Date("2026-04-04T13:00:00Z"),
    },
  });
  await prisma.charge.createMany({
    data: [
      {
        accountId: account.id,
        period: "2026-04",
        amountKop: 745000,
        source: "subscription",
        description: "Корпоративный интернет 500 Мбит/с · Головной офис (2026-04)",
        invoiceId: aprInvoice.id,
      },
      {
        accountId: account.id,
        period: "2026-04",
        amountKop: 500000,
        source: "subscription",
        description: "Корпоративный интернет 500 Мбит/с · Склад «Юг» (2026-04)",
        invoiceId: aprInvoice.id,
      },
    ],
  });
  await prisma.payment.create({
    data: {
      accountId: account.id,
      amountKop: 1245000,
      method: "bank_transfer",
      externalRef: "PP-2026-04-019",
      note: "Платёжное поручение от 04.04",
      createdAt: new Date("2026-04-04T13:00:00Z"),
    },
  });

  // May invoice — issued, not paid
  const mayInvoice = await prisma.invoice.create({
    data: {
      number: "СЧ-2026-000002",
      accountId: account.id,
      period: "2026-05",
      totalKop: 1245000,
      vatKop: Math.round((1245000 * 20) / 120),
      status: "issued",
      issuedAt: new Date("2026-05-01T09:00:00Z"),
      dueAt: new Date("2026-05-11T09:00:00Z"),
    },
  });
  await prisma.charge.createMany({
    data: [
      {
        accountId: account.id,
        period: "2026-05",
        amountKop: 745000,
        source: "subscription",
        description: "Корпоративный интернет 500 Мбит/с · Головной офис (2026-05)",
        invoiceId: mayInvoice.id,
      },
      {
        accountId: account.id,
        period: "2026-05",
        amountKop: 500000,
        source: "subscription",
        description: "Корпоративный интернет 500 Мбит/с · Склад «Юг» (2026-05)",
        invoiceId: mayInvoice.id,
      },
    ],
  });

  console.log("→ Seeding incidents + RFO…");
  await prisma.incidentUpdate.deleteMany({});
  await prisma.serviceIncident.deleteMany({});
  const internetService = await prisma.service.findFirst({ where: { category: "business" } });

  const incidentResolved = await prisma.serviceIncident.create({
    data: {
      serviceId: internetService?.id ?? null,
      title: "Деградация на узле М-9",
      summary: "Часть клиентов наблюдала повышенный latency на западном направлении.",
      severity: "minor",
      componentSlugs: JSON.stringify(["core-network"]),
      affectedOrgIds: JSON.stringify([]),
      startedAt: new Date("2026-04-22T07:14:00Z"),
      resolvedAt: new Date("2026-04-22T08:48:00Z"),
      publicRfo:
        "Причиной стал отказ платы 100G на узле М-9. Резервный канал поднялся за 1.5 часа, латенси вернулась в норму.",
    },
  });
  await prisma.incidentUpdate.createMany({
    data: [
      {
        incidentId: incidentResolved.id,
        status: "investigating",
        message: "Получены сигналы о деградации, ведём диагностику.",
        createdAt: new Date("2026-04-22T07:18:00Z"),
      },
      {
        incidentId: incidentResolved.id,
        status: "identified",
        message: "Проблема локализована: отказ платы 100G на узле М-9.",
        createdAt: new Date("2026-04-22T07:42:00Z"),
      },
      {
        incidentId: incidentResolved.id,
        status: "resolved",
        message: "Канал переключён на резерв, метрики в норме.",
        createdAt: new Date("2026-04-22T08:48:00Z"),
      },
    ],
  });

  await prisma.serviceIncident.create({
    data: {
      serviceId: internetService?.id ?? null,
      title: "Плановые работы на ядре сети",
      summary: "Замена прошивок MX-серии. Возможны кратковременные обрывы сессий BGP.",
      severity: "maintenance",
      componentSlugs: JSON.stringify(["core-network"]),
      startedAt: new Date("2026-05-12T01:00:00Z"),
      isPublic: true,
    },
  });

  console.log("→ Seeding tickets…");
  await prisma.ticketMessage.deleteMany({});
  await prisma.ticket.deleteMany({});

  const slaWindowMs = 4 * 3600_000;
  const ticket1 = await prisma.ticket.create({
    data: {
      number: 1024,
      organizationId: horns.id,
      openedById: tech.id,
      assignedToId: manager.id,
      subject: "Падение скорости на складе «Юг»",
      category: "technical",
      priority: "high",
      status: "in_progress",
      slaRespondAt: new Date(Date.now() + slaWindowMs / 2),
      slaResolveAt: new Date(Date.now() + 12 * 3600_000),
      firstResponseAt: new Date(Date.now() - 30 * 60_000),
    },
  });
  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: tech.id,
        body: "Здравствуйте! С 14:00 наблюдаем падение скорости на складе «Юг» с 500 до ~80 Мбит/с. Графики прилагаю.",
        isInternal: false,
        createdAt: new Date(Date.now() - 90 * 60_000),
      },
      {
        ticketId: ticket1.id,
        authorId: manager.id,
        body: "Принято, передал на NOC. На вашей стороне трассировку не запускайте, мы сейчас сами снимем дампы.",
        isInternal: false,
        createdAt: new Date(Date.now() - 30 * 60_000),
      },
    ],
  });

  await prisma.ticket.create({
    data: {
      number: 1025,
      organizationId: horns.id,
      openedById: accountant.id,
      subject: "Запрос акта сверки за Q1 2026",
      category: "billing",
      priority: "normal",
      status: "open",
      slaRespondAt: new Date(Date.now() + 8 * 3600_000),
      slaResolveAt: new Date(Date.now() + 48 * 3600_000),
      messages: {
        create: {
          authorId: accountant.id,
          body: "Добрый день, пришлите, пожалуйста, акт сверки за период 01.01–31.03.2026.",
        },
      },
    },
  });

  console.log("→ Seeding connection request demo…");
  await prisma.connectionRequest.deleteMany({});
  await prisma.connectionRequest.create({
    data: {
      organizationId: horns.id,
      contactName: "Семён Авдеев",
      contactPhone: "+7 (495) 555-01-01",
      contactEmail: "director@horns-hooves.ru",
      inn: horns.inn,
      legalName: horns.legalName,
      address: "Москва, Цветной бульвар, 25",
      lat: 55.7708,
      lng: 37.6207,
      serviceType: "l2vpn",
      speedMbps: 1000,
      status: "survey",
      surveyAvailability: "available",
      surveyNotes: "Дом подключён к ВОЛС оператора, есть свободные пары. Срок монтажа — 5 рабочих дней.",
      notes: "Открываем третий офис, нужен L2-VPN до головного.",
    },
  });

  console.log("→ Seeding NPS…");
  await prisma.npsResponse.deleteMany({ where: { organizationId: horns.id } });
  await prisma.npsResponse.createMany({
    data: [
      { organizationId: horns.id, userId: director.id, score: 9, comment: "Прозрачный биллинг, быстро отвечает менеджер." },
      { organizationId: horns.id, userId: accountant.id, score: 8, comment: "Хочется увидеть ЭДО." },
    ],
  });

  console.log("✓ Seed complete.");
  console.log("  • Demo (B2C) login: demo@rutega.ru / Demo12345!");
  console.log("  • B2B Director:      director@horns-hooves.ru / Director1!");
  console.log("  • B2B Accountant:    buh@horns-hooves.ru / Accountant1!");
  console.log("  • B2B Tech:          tech@horns-hooves.ru / TechSpec1!");
  console.log("  • Manager:           manager@rutega.local / Manager1!");
  console.log("  • Admin login:       karim2222 / karim22333");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
