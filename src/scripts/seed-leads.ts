import { prisma } from '../lib/prisma';

const mockLeads = [
  { firstName: 'Hugo', lastName: 'Martin', email: 'hugo.martin@gmail.com', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Camille', lastName: 'Dubois', email: 'camille.dubois@wanadoo.fr', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Lucas', lastName: 'Bernard', email: 'lucas.bernard@sfr.fr', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Chloé', lastName: 'Thomas', email: 'chloe.thomas@yahoo.fr', source: 'NEWSLETTER', status: 'UNSUBSCRIBED' },
  { firstName: 'Alexandre', lastName: 'Petit', email: 'alexandre.petit@orange.fr', source: 'EBOOK_OPTIN', status: 'BLOCKED' },
  { firstName: 'Manon', lastName: 'Robert', email: 'manon.robert@outlook.fr', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Julien', lastName: 'Richard', email: 'julien.richard@freelance-ia.io', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Sarah', lastName: 'Durand', email: 'sarah.durand@designstudio.fr', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Nicolas', lastName: 'Moreau', email: 'nicolas.moreau@techsolop.com', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Emma', lastName: 'Laurent', email: 'emma.laurent@notionexpert.fr', source: 'NEWSLETTER', status: 'SUBSCRIBED' },
  { firstName: 'Mathieu', lastName: 'Simon', email: 'mathieu.simon@agency.fr', source: 'EBOOK_OPTIN', status: 'BLOCKED' },
  { firstName: 'Léa', lastName: 'Michel', email: 'lea.michel@consulting.io', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Romain', lastName: 'Lefebvre', email: 'romain.lefebvre@solopreneur.net', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Clara', lastName: 'Leroy', email: 'clara.leroy@digitalart.fr', source: 'EBOOK_OPTIN', status: 'UNSUBSCRIBED' },
  { firstName: 'Antoine', lastName: 'Roux', email: 'antoine.roux@freelance.fr', source: 'NEWSLETTER', status: 'SUBSCRIBED' },
  { firstName: 'Inès', lastName: 'David', email: 'ines.david@marketing.io', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Maxime', lastName: 'Bertrand', email: 'maxime.bertrand@tech.fr', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Jade', lastName: 'Morel', email: 'jade.morel@studio.fr', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Paul', lastName: 'Fournier', email: 'paul.fournier@consultant.fr', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Laura', lastName: 'Girard', email: 'laura.girard@design.io', source: 'EBOOK_OPTIN', status: 'BLOCKED' },
  { firstName: 'Gabriel', lastName: 'Bonnet', email: 'gabriel.bonnet@webdev.fr', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Zoé', lastName: 'Dupont', email: 'zoe.dupont@freelance.io', source: 'NEWSLETTER', status: 'SUBSCRIBED' },
  { firstName: 'Thomas', lastName: 'Lambert', email: 'thomas.lambert@agency.io', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Chloé', lastName: 'Fontaine', email: 'chloe.fontaine@creative.fr', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Arthur', lastName: 'Rousseau', email: 'arthur.rousseau@techhub.fr', source: 'EBOOK_OPTIN', status: 'UNSUBSCRIBED' },
  { firstName: 'Éva', lastName: 'Vincent', email: 'eva.vincent@solodev.fr', source: 'FREE_RESOURCE', status: 'SUBSCRIBED' },
  { firstName: 'Clément', lastName: 'Muller', email: 'clement.muller@saas.io', source: 'CUSTOMER', status: 'SUBSCRIBED' },
  { firstName: 'Alice', lastName: 'Faure', email: 'alice.faure@coaching.fr', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
  { firstName: 'Quentin', lastName: 'André', email: 'quentin.andre@product.io', source: 'NEWSLETTER', status: 'SUBSCRIBED' },
  { firstName: 'Victor', lastName: 'Mercier', email: 'victor.mercier@copywriter.fr', source: 'EBOOK_OPTIN', status: 'SUBSCRIBED' },
];

async function main() {
  console.log('Seeding 30 mock leads...');

  const lists = await prisma.leadList.findMany();
  const ebookList = lists.find((l) => l.sourceType === 'EBOOK_OPTIN') || lists[0];
  const resourceList = lists.find((l) => l.sourceType === 'FREE_RESOURCE') || lists[0];
  const customerList = lists.find((l) => l.sourceType === 'CUSTOMERS') || lists[0];

  let count = 0;

  for (const item of mockLeads) {
    let targetListId = ebookList?.id;
    if (item.source === 'FREE_RESOURCE') targetListId = resourceList?.id || ebookList?.id;
    if (item.source === 'CUSTOMER') targetListId = customerList?.id || ebookList?.id;

    await prisma.lead.upsert({
      where: { email: item.email },
      update: {
        firstName: item.firstName,
        lastName: item.lastName,
        source: item.source,
        status: item.status,
        listId: targetListId,
      },
      create: {
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName,
        source: item.source,
        status: item.status,
        listId: targetListId,
      },
    });

    count++;
  }

  console.log(`✅ ${count} contacts fictifs insérés avec succès !`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
