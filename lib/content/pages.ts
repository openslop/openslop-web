import { ORGANIZATION_ADDRESS_LINE } from "@/lib/seo/organization";
import type { Doc } from "./types";

const LEGAL_UPDATED = "February 15, 2026";

export const homeDoc: Doc = {
  path: "/",
  title: "OpenSlop - Free Open-Source AI Content Creator",
  description:
    "Free open-source AI video pipeline. A single prompt becomes a finished video - no GPU, no manual editing.",
  intro: [
    "OpenSlop is a free, open-source AI video creation pipeline that turns a single prompt into a finished video. It orchestrates the model providers you already use - Claude for scripting, Runware and Kling for imagery and motion, Cartesia and ElevenLabs for voice, ffmpeg for assembly - into one automated workflow that runs on your own API keys.",
    "It is built for faceless YouTube, TikTok, and Shorts creators who want to publish AI-generated video at scale without paying for an all-in-one tool that produces generic output. Everything is modular: swap any model, edit any stage, keep every asset.",
  ],
  sections: [
    {
      heading: "One prompt, a finished video",
      body: [
        "Describe the video you want and OpenSlop writes the script, storyboards every beat, generates the images, animates the shots worth animating, records the narration, scores the music, and assembles the final cut. There is no timeline to drag and no render farm to rent - the pipeline runs end to end and hands back a publish-ready file.",
      ],
    },
    {
      heading: "Every model stays swappable",
      body: [
        "Each stage of the pipeline is a module behind a common interface, so a new image model or a cheaper TTS provider is a config change rather than a rewrite. Bring your own API keys, mix providers per stage, and keep the intermediate assets - scripts, shot lists, stills, audio stems - as ordinary files you own. The full provider list - LLMs, image, video, voice, music, lip sync, and inference routers - is in [AGENTS.md](/AGENTS.md).",
      ],
    },
    {
      heading: "Scripts that don't sound like a model wrote them",
      body: [
        "OpenSlop scripts with narrative diffusion, a multi-pass method that drafts, critiques, and rewrites a script before a single frame is generated. Characters keep their faces across shots, pacing follows a retention curve instead of a template, and the narration reads like a person rather than a summary.",
      ],
    },
    {
      heading: "Open-source and free forever",
      body: [
        "The pipeline is open source on GitHub and free to run. You pay the model providers directly at cost - there is no per-video markup, no seat pricing, and no watermark. Self-host it, fork it, or wire it into an existing content workflow.",
      ],
    },
  ],
};

export const aboutDoc: Doc = {
  path: "/about",
  title: "About OpenSlop",
  description:
    "OpenSlop is an open-source AI media generation pipeline built by engineers from Meta, Google, Stripe, and Dropbox.",
  sections: [
    {
      heading: "Our Mission",
      body: [
        "OpenSlop is building an AI-powered media generation platform that makes it easy to create high-quality video, music, images, and narration from simple text prompts. We believe creative tools should be accessible to everyone.",
      ],
    },
    {
      heading: "The Team",
      body: [
        "We're a small team of engineers from companies like Meta, Google, Stripe, and Dropbox who are passionate about the intersection of AI and creativity. We're building OpenSlop to push the boundaries of what's possible with generative media.",
      ],
    },
    {
      heading: "Contact Us",
      body: [
        "Have questions, feedback, or partnership inquiries? We'd love to hear from you.",
      ],
      list: ["**Email:** [hi@openslop.ai](mailto:hi@openslop.ai)"],
      listStyle: "plain",
    },
  ],
};

export const contactDoc: Doc = {
  path: "/contact",
  title: "Contact OpenSlop",
  description:
    "How to reach the OpenSlop team - email, Discord, GitHub issues, press, and security reports.",
  intro: [
    "OpenSlop is maintained by a small team that reads everything it receives. Whichever channel you pick below reaches a person, and we aim to reply to email within two business days.",
  ],
  sections: [
    {
      heading: "Email",
      body: [
        "General questions, beta access, partnership and press inquiries: [hi@openslop.ai](mailto:hi@openslop.ai). This is the right address for anything that is not a code issue - billing questions about provider keys, help planning a channel, or a request to talk to the team about using OpenSlop at scale.",
      ],
    },
    {
      heading: "Community",
      body: [
        "Join the [OpenSlop Discord](https://discord.gg/zeP5482ced) to compare pipeline configs, share prompts and model settings, and get help from other creators in real time. The maintainers are in the server most days and it is the fastest way to get an answer about a specific model or provider.",
      ],
    },
    {
      heading: "Bugs and feature requests",
      body: [
        "The pipeline is developed in the open at [github.com/openslop/openslop](https://github.com/openslop/openslop). File an issue there for bugs, provider integrations, and feature requests, and open a pull request if you have a fix - contributions are reviewed by the core team.",
      ],
    },
    {
      heading: "Mailing address",
      body: [
        `OpenSlop, ${ORGANIZATION_ADDRESS_LINE}. Post reaches us slowly - email is faster for anything time-sensitive.`,
      ],
    },
    {
      heading: "Security and privacy",
      body: [
        "Report a suspected vulnerability privately to [hi@openslop.ai](mailto:hi@openslop.ai) rather than in a public issue, and we will acknowledge it before disclosing anything. For data access, correction, or deletion requests, use the same address and see our [Privacy Policy](/privacy) for what we collect and how long we keep it.",
      ],
    },
  ],
};

export const developersDoc: Doc = {
  path: "/developers",
  title: "OpenSlop Developer Resources",
  description:
    "Source code, agent instructions, machine-readable endpoints, and integration notes for building on OpenSlop.",
  intro: [
    "Everything an engineer or an AI agent needs to work with OpenSlop lives at a predictable URL. The pipeline itself is a self-hosted open-source project rather than a hosted API, so integration means running or extending the repository.",
  ],
  sections: [
    {
      heading: "Source code",
      body: [
        "The OpenSlop pipeline is open source at [github.com/openslop/openslop](https://github.com/openslop/openslop). The repository README covers installation, the provider keys each stage expects, and how to run a full generation locally. Each pipeline stage - scripting, storyboarding, image generation, animation, narration, music, assembly - is a module you can replace.",
      ],
    },
    {
      heading: "Agent instructions",
      body: [
        "Agents should start at [/AGENTS.md](/AGENTS.md), which states when OpenSlop is the right tool, what it cannot do, and how to call it. [/llms.txt](/llms.txt) is the machine-readable index of this site and [/llms-full.txt](/llms-full.txt) concatenates the full text of every page for retrieval.",
      ],
    },
    {
      heading: "Markdown endpoints",
      body: [
        "Every page on openslop.ai is available as Markdown. Send `Accept: text/markdown` to any URL, or append `.md` to the path - [/developers.md](/developers.md) and [/blog.md](/blog.md) both work. Responses set `Vary: Accept` so caches keep the HTML and Markdown variants apart, per [acceptmarkdown.com](https://acceptmarkdown.com).",
      ],
    },
    {
      heading: "Feeds and site metadata",
      body: [
        "New posts are published to the [RSS feed](/feed.xml). The [sitemap](/sitemap.xml) lists every canonical URL, and [robots.txt](/robots.txt) points crawlers at both. There is no hosted REST API, no OAuth flow, and no webhook system today - if you need one, tell us at [hi@openslop.ai](mailto:hi@openslop.ai).",
      ],
    },
  ],
};

export const privacyDoc: Doc = {
  path: "/privacy",
  title: "Privacy Policy",
  description: "What OpenSlop collects, how it is used, and your rights.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: "1. Information We Collect",
      body: [
        "We may collect the following types of information when you use OpenSlop:",
      ],
      list: [
        "**Account information:** name, email address, and other details you provide when signing up",
        "**Usage data:** how you interact with the Service, including pages visited, features used, and timestamps",
        "**Device information:** browser type, operating system, IP address, and device identifiers",
      ],
    },
    {
      heading: "2. How We Use Your Information",
      body: ["We use the information we collect to:"],
      list: [
        "Provide, maintain, and improve the Service",
        "Communicate with you about updates, security alerts, and support",
        "Analyze usage patterns to enhance user experience and performance",
        "Comply with legal obligations and enforce our Terms",
      ],
    },
    {
      heading: "3. Data Sharing",
      body: [
        "We do not sell your personal information. We may share data with third parties only in the following circumstances:",
      ],
      list: [
        "With service providers who assist us in operating the Service",
        "When required by law or to protect our legal rights",
        "In connection with a merger, acquisition, or sale of assets",
      ],
    },
    {
      heading: "4. Cookies",
      body: [
        "We use cookies and similar technologies to remember your preferences, understand how you use the Service, and improve your experience. You can control cookie settings through your browser preferences.",
      ],
    },
    {
      heading: "5. Data Security",
      body: [
        "We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      heading: "6. Data Retention",
      body: [
        "We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your data by contacting us.",
      ],
    },
    {
      heading: "7. Your Rights",
      body: [
        "Depending on your location, you may have the right to access, correct, delete, or port your personal data. To exercise these rights, please contact us at the address below.",
      ],
    },
    {
      heading: "8. Changes to This Policy",
      body: [
        'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date.',
      ],
    },
    {
      heading: "9. Contact Us",
      body: [
        "If you have questions about this Privacy Policy, please contact us at [hi@openslop.ai](mailto:hi@openslop.ai).",
      ],
    },
  ],
};

export const termsDoc: Doc = {
  path: "/terms",
  title: "Terms of Service",
  description: "The terms that govern your use of OpenSlop.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: [
        'By accessing or using OpenSlop ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the Service.',
      ],
    },
    {
      heading: "2. Description of Service",
      body: [
        "OpenSlop provides an AI-powered media generation platform. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.",
      ],
    },
    {
      heading: "3. Use License",
      body: [
        "Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal or internal business purposes. You may not:",
      ],
      list: [
        "Modify or copy the Service's source materials",
        "Use the Service for any unlawful purpose or in violation of any applicable laws",
        "Attempt to reverse-engineer or extract the source code of the Service",
        "Transfer your account or access rights to another party without our consent",
      ],
    },
    {
      heading: "4. User Content",
      body: [
        "You retain ownership of content you create using the Service. By using the Service, you grant us a non-exclusive license to process your inputs solely for the purpose of delivering the Service to you.",
      ],
    },
    {
      heading: "5. Limitation of Liability",
      body: [
        "To the fullest extent permitted by law, OpenSlop and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.",
      ],
    },
    {
      heading: "6. Disclaimer of Warranties",
      body: [
        'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      ],
    },
    {
      heading: "7. Changes to Terms",
      body: [
        "We may revise these Terms at any time by updating this page. Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.",
      ],
    },
    {
      heading: "8. Contact Us",
      body: [
        "If you have questions about these Terms, please contact us at [hi@openslop.ai](mailto:hi@openslop.ai).",
      ],
    },
  ],
};
