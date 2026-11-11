
import fs from 'node:fs';

const baseOrganisations = [
  {
    id: 1,
    name: "Northwind Traders",
    status: "active",
    memberCount: 42,
    owner: { email: "ops@northwind.example" },
    createdAt: "2024-03-11T09:12:00Z"
  },
  {
    id: 2,
    name: "",
    status: "ACTIVE",
    memberCount: "12",
    owner: { email: "a@b.example" },
    createdAt: 1710150720000
  },
  {
    id: 3,
    name: null,
    status: "Active",
    memberCount: -1,
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: 42,
    name: "Globex Corporation",
    status: "suspended",
    memberCount: 7,
    owner: { email: "hq@globex.example" },
    createdAt: "2023-11-30T14:45:10Z"
  },
  {
    id: 42,
    name: "Globex Corporation Ltd",
    status: "actve",
    memberCount: 7,
    owner: { email: "hq@globex.example" },
    createdAt: "2023-11-30T14:45:10Z"
  },
  {
    id: 6,
    name: "\u202Bشركة الأمل\u202C 🚀    ",
    status: "active",
    memberCount: 3,
    owner: { email: "info@amal.example" },
    createdAt: "2025-06-01T08:00:00Z"
  },
  {
    id: 7,
    name: "The Very Long Organisation Name That Somebody Actually Typed Into The Field Because Nobody Validated It And It Keeps Going Well Past Any Reasonable Column Width And Still Has Not Stopped",
    status: "inactive",
    memberCount: 0,
    owner: { email: "long@example.com" },
    createdAt: "2024-07-19T16:20:00Z"
  },
  {
    id: 8,
    name: "Initech",
    status: null,
    memberCount: null,
    owner: { email: "not-an-email" },
    createdAt: "not a date"
  }
];

// Start with the exact original eight records.
const organisations = [...baseOrganisations];

// Generate additional records while retaining data quirks.
for (let index = 8; index < 140; index++) {
  const source = baseOrganisations[index % baseOrganisations.length];

  const organisation = structuredClone(source);

  // Keep some duplicate IDs intentionally.
  organisation.id = index % 10 === 0 ? 42 : index + 1;

  // Vary valid organisation names without removing malformed names.
  if (
    typeof organisation.name === "string" &&
    organisation.name.length > 0 &&
    index % 3 === 0
  ) {
    organisation.name += ` - Branch ${index}`;
  }

  // Introduce more status inconsistencies.
  if (organisation.status === "active" && index % 4 === 0) {
    organisation.status = "ACTIVE";
  }

  if (organisation.status === "inactive" && index % 5 === 0) {
    organisation.status = "Inactive";
  }

  // Vary valid numeric member counts.
  if (
    typeof organisation.memberCount === "number" &&
    organisation.memberCount >= 0
  ) {
    organisation.memberCount += index % 20;
  }

  // Vary valid dates while retaining invalid dates and timestamps.
  if (
    typeof organisation.createdAt === "string" &&
    !Number.isNaN(Date.parse(organisation.createdAt))
  ) {
    const date = new Date(
      Date.parse(organisation.createdAt) + index * 86400000
    );

    organisation.createdAt = date.toISOString();
  }

  organisations.push(organisation);
}

// Save the fixture.
fs.mkdirSync("src/assets/data", { recursive: true });

fs.writeFileSync(
  "src/assets/data/organisations.json",
  JSON.stringify(organisations, null, 2)
);

console.log(`Successfully generated ${organisations.length} organisations.`);
