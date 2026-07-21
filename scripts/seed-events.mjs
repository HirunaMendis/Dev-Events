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
  {
    title: "seL4 Summit 2026",
    image: "/images/event1.png",
    slug: "sel4-summit-2026",
    location: "Vancouver, British Columbia, Canada",
    date: "September 1-3, 2026",
    time: "Schedule to be announced",
    description:
      "The seL4 Summit is the annual international gathering for the seL4 microkernel community and formally verified software. It brings together developers, researchers, users, and organizations working on highly assured systems.",
    agenda: ["Day 1 - Applications, overviews, and perspectives", "Day 2 - Technical development and research sessions", "Day 3 - Reports, discussions, and community collaboration"],
    about: "The seL4 Foundation and the wider seL4 community organize the summit to advance dependable, formally verified systems.",
    tags: ["Security", "Open Source", "Systems"],
    mode: "In-person",
    audience: "Systems developers, researchers, security engineers, and seL4 community members",
  },
  {
    title: "Cloud Foundry Summit 2026",
    image: "/images/event2.png",
    slug: "cloud-foundry-summit-2026",
    location: "Heidelberg, Germany",
    date: "September 21-22, 2026",
    time: "9:00 AM CEST",
    description:
      "Cloud Foundry Summit brings end users, platform operators, contributors, maintainers, and industry leaders together to discuss modern application platforms, declarative infrastructure, and the future of cloud-native delivery.",
    agenda: ["Day 1 - Technical sessions and attendee reception", "Day 2 - Platform and community sessions"],
    about: "Cloud Foundry Summit is hosted by the Cloud Foundry Foundation and its global ecosystem of users and contributors.",
    tags: ["Cloud", "DevOps", "Open Source"],
    mode: "In-person",
    audience: "Platform operators, developers, contributors, maintainers, and cloud architects",
  },
  {
    title: "OpenSearchCon North America 2026",
    image: "/images/event3.png",
    slug: "opensearchcon-north-america-2026",
    location: "San Jose Marriott, San Jose, CA",
    date: "September 22-24, 2026",
    time: "9:00 AM PDT",
    description:
      "OpenSearchCon North America brings the global OpenSearch community together to explore search, vector databases, observability, security, and agentic AI. It is designed for practitioners building and operating modern search and analytics systems.",
    agenda: ["Day 1 - Keynotes, breakouts, Solutions Showcase, and Search Party", "Day 2 - Keynotes, breakouts, and unconference", "Day 3 - Keynotes, breakouts, and Solutions Showcase"],
    about: "OpenSearchCon is organized by the OpenSearch Project community for engineers, architects, and open-source contributors.",
    tags: ["Search", "AI", "Observability"],
    mode: "In-person",
    audience: "Search engineers, AI practitioners, DevOps teams, SREs, and data architects",
  },
  {
    title: "PromCon Europe 2026",
    image: "/images/event4.png",
    slug: "promcon-europe-2026",
    location: "Munich, Germany",
    date: "October 7-8, 2026",
    time: "Schedule to be announced",
    description:
      "PromCon Europe is a community event for people who build, operate, and contribute to the Prometheus monitoring ecosystem. The program focuses on observability, metrics, reliability, and real-world production operations.",
    agenda: ["Day 1 - Community talks and technical sessions", "Day 2 - Prometheus ecosystem sessions and networking"],
    about: "PromCon is supported by the Prometheus community and brings together maintainers, users, and observability practitioners.",
    tags: ["Observability", "Prometheus", "Cloud"],
    mode: "In-person",
    audience: "SREs, DevOps engineers, platform teams, and Prometheus contributors",
  },
  {
    title: "All Things Open 2026",
    image: "/images/event5.png",
    slug: "all-things-open-2026",
    location: "Raleigh Convention Center, Raleigh, NC",
    date: "October 19-20, 2026",
    time: "Schedule to be announced",
    description:
      "All Things Open is a major open-source, technology, and web conference focused on the tools, processes, and people making open source possible. The 2026 program includes workshops, deep dives, co-located events, and a full conference day.",
    agenda: ["Day 1 - Extended workshops, deep dives, and co-located events", "Day 2 - Keynotes and more than 100 open-source technology speakers"],
    about: "All Things Open is part of the All Things Open Network, which creates accessible, world-class open-source education and community events.",
    tags: ["Open Source", "Web", "AI"],
    mode: "In-person",
    audience: "Developers, open-source contributors, technology leaders, and students",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event6.png",
    slug: "kubecon-cloudnativecon-north-america-2026",
    location: "Salt Palace Convention Center, Salt Lake City, UT",
    date: "November 9-12, 2026",
    time: "8:00 AM MST",
    description:
      "KubeCon + CloudNativeCon North America is the Cloud Native Computing Foundation's flagship conference. It brings together developers, architects, platform teams, and open-source communities to collaborate on the future of cloud-native computing.",
    agenda: ["Day 1 - Co-located events and project lightning talks", "Day 2 - Keynotes, breakouts, and Solutions Showcase", "Day 3 - Keynotes, breakouts, and Solutions Showcase", "Day 4 - Keynotes, breakouts, and Solutions Showcase"],
    about: "The Cloud Native Computing Foundation hosts KubeCon + CloudNativeCon for its global community of cloud-native projects and practitioners.",
    tags: ["Kubernetes", "Cloud", "Open Source"],
    mode: "In-person",
    audience: "Developers, architects, technical leaders, SREs, and open-source maintainers",
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
