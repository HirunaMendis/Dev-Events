import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const events = [
  {
    title: "PyCon US 2026",
    image: "/images/event1.png",
    slug: "pycon-us-2026",
    location: "Long Beach Convention Center, Long Beach, CA",
    date: "May 15-17, 2026",
    time: "9:00 AM PDT",
    description:
      "PyCon US brings the global Python community together for practical talks, hands-on tutorials, open spaces, and conversations with the people building Python tools and libraries. Explore new ideas in AI, web development, data, security, and the wider open-source ecosystem.",
    agenda: ["9:00 AM - Community keynote and opening sessions", "11:00 AM - Python, AI, and web-development talks", "2:00 PM - Open spaces and contributor meetups", "5:00 PM - Community networking"],
    about: "PyCon US is organized by the Python Software Foundation and its community of volunteers, maintainers, and educators.",
    tags: ["Python", "AI", "Open Source"],
    mode: "In-person",
    audience: "Python developers, maintainers, students, and technology leaders",
  },
  {
    title: "React Conf",
    image: "/images/event2.png",
    slug: "react-conf",
    location: "Henderson, NV",
    date: "October 7-8, 2025",
    time: "9:00 AM PDT",
    description:
      "React Conf is a focused gathering for developers who build with React and the modern web platform. Hear directly from the React community, learn about new patterns for user interfaces, and meet engineers sharing production experience from teams around the world.",
    agenda: ["9:00 AM - React ecosystem keynote", "10:45 AM - Product and framework sessions", "1:00 PM - Community panels", "4:00 PM - Developer networking"],
    about: "React Conf is built by and for the React community, bringing together the people creating tools, libraries, and products with React.",
    tags: ["Frontend", "React", "JavaScript"],
    mode: "In-person",
    audience: "Frontend developers, product engineers, and technical leads",
  },
  {
    title: "KubeCon + CloudNativeCon North America",
    image: "/images/event3.png",
    slug: "kubecon-cloudnativecon-north-america",
    location: "Atlanta, GA",
    date: "November 10-13, 2025",
    time: "9:00 AM EST",
    description:
      "KubeCon + CloudNativeCon is the flagship gathering for cloud-native developers and platform teams. The program covers Kubernetes, observability, security, infrastructure, and the open-source projects that power modern applications.",
    agenda: ["9:00 AM - Cloud-native keynote", "11:00 AM - Kubernetes and platform engineering tracks", "2:00 PM - Maintainer and community sessions", "5:00 PM - Project meetups"],
    about: "KubeCon + CloudNativeCon is hosted by the Cloud Native Computing Foundation and its global open-source community.",
    tags: ["Kubernetes", "Cloud", "DevOps"],
    mode: "In-person",
    audience: "Platform engineers, SREs, developers, and open-source maintainers",
  },
  {
    title: "GitHub Universe",
    image: "/images/event4.png",
    slug: "github-universe",
    location: "San Francisco, CA",
    date: "October 28-29, 2025",
    time: "9:00 AM PDT",
    description:
      "GitHub Universe brings developers, maintainers, and engineering leaders together to explore how they build, ship, and secure software. Expect product sessions, technical workshops, and practical discussions about collaboration and AI-assisted development.",
    agenda: ["9:30 AM - GitHub keynote", "11:00 AM - Security and AI sessions", "1:00 PM - Collaboration workshops", "4:30 PM - Community demos and networking"],
    about: "GitHub Universe is GitHub's annual event for the global developer community and the teams shaping modern software development.",
    tags: ["GitHub", "AI", "Open Source"],
    mode: "Hybrid",
    audience: "Developers, designers, engineering leaders, and open-source contributors",
  },
  {
    title: "FOSDEM 2026",
    image: "/images/event5.png",
    slug: "fosdem-2026",
    location: "ULB Campus Solbosch, Brussels, Belgium",
    date: "January 31-February 1, 2026",
    time: "9:00 AM CET",
    description:
      "FOSDEM is a community-driven conference for free and open-source software. It offers developer rooms, lightning talks, and informal meetups covering everything from operating systems and programming languages to privacy and developer tooling.",
    agenda: ["9:00 AM - Developer rooms open", "11:00 AM - Community-led technical talks", "2:00 PM - Lightning talks and project sessions", "5:00 PM - Informal meetups"],
    about: "FOSDEM is organized by volunteers and supported by the free and open-source software community.",
    tags: ["Open Source", "Community", "Linux"],
    mode: "In-person",
    audience: "Open-source contributors, developers, and technology enthusiasts",
  },
  {
    title: "DeveloperWeek 2026",
    image: "/images/event6.png",
    slug: "developerweek-2026",
    location: "San Jose Convention Center, San Jose, CA",
    date: "February 18-20, 2026",
    time: "9:00 AM PST",
    description:
      "DeveloperWeek is a conference for software engineers, architects, and engineering teams building the next generation of developer tools and applications. Sessions span AI, APIs, cloud platforms, software delivery, and the developer experience.",
    agenda: ["9:00 AM - Developer trends keynote", "10:30 AM - AI and API sessions", "1:30 PM - Engineering leadership panels", "4:00 PM - Tool demos and networking"],
    about: "DeveloperWeek connects software professionals and companies working on modern tools, platforms, and developer experiences.",
    tags: ["Developer Tools", "APIs", "Cloud"],
    mode: "In-person",
    audience: "Software engineers, architects, product teams, and engineering leaders",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DB ?? "dev-events")
    .collection("events");

  await collection.createIndex({ slug: 1 }, { unique: true });
  const operations = events.map((event) => ({
    updateOne: {
      filter: { slug: event.slug },
      update: { $set: event, $setOnInsert: { createdAt: new Date() } },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations);
  console.log(`Seeded ${events.length} events (${result.upsertedCount} new).`);
} finally {
  await client.close();
}
