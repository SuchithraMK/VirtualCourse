import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";

dotenv.config();

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    // Validation
    if (!input || input.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const normalizedInput = input.trim().toLowerCase();
    console.log("🔍 Original Input:", input);
    console.log("🔍 Normalized Input:", normalizedInput);

    /* ================ ULTRA COMPREHENSIVE KEYWORD MAPPINGS ================ */
    const keywordMappings = {
      // Programming Languages (Complete)
      "c programming": ["c programming", "c language", "programming in c", "c lang", "learn c", "c course", "c tutorial", "ansi c", "turbo c"],
      "c++": ["c++", "cpp", "c plus plus", "cplusplus", "c++ programming", "learn cpp", "cpp course", "cpp tutorial", "object oriented c"],
      "c#": ["c#", "csharp", "c sharp", "c# programming", "learn c#", "csharp course", "dotnet", ".net"],
      javascript: ["javascript", "js", "java script", "javascirpt", "javasript", "learn javascript", "js course", "ecmascript", "es6", "vanilla js", "JavaScript"],
      typescript: ["typescript", "ts", "type script", "learn typescript", "ts course", "typed javascript"],
      python: ["python", "py", "pyhton", "phyton", "python programming", "learn python", "python course", "pyton", "python3", "py3"],
      java: ["java", "java programming", "learn java", "java course", "core java", "advanced java"],
      php: ["php", "php programming", "learn php", "hypertext preprocessor"],
      ruby: ["ruby", "ruby programming", "ruby on rails", "rails"],
      go: ["go", "golang", "go programming", "go lang"],
      rust: ["rust", "rust programming", "rust lang"],
      kotlin: ["kotlin", "kotlin programming", "android kotlin"],
      swift: ["swift", "swift programming", "ios swift"],
      scala: ["scala", "scala programming"],
      r: ["r programming", "r language", "r statistical"],
      perl: ["perl", "perl programming"],
      dart: ["dart", "dart programming", "flutter dart"],
      
      // Frontend Frameworks & Libraries
      react: ["react", "reactjs", "react.js", "react js", "raect", "reactjs course", "learn react", "react framework"],
      angular: ["angular", "angularjs", "angular js", "learn angular", "angular framework"],
      vue: ["vue", "vuejs", "vue.js", "vue js", "learn vue", "vue framework"],
      svelte: ["svelte", "sveltejs", "svelte framework"],
      nextjs: ["nextjs", "next.js", "next js", "next"],
      nuxt: ["nuxt", "nuxtjs", "nuxt.js"],
      gatsby: ["gatsby", "gatsbyjs"],
      
      // Backend Frameworks
      "node.js": ["nodejs", "node.js", "node js", "node", "learn nodejs", "backend nodejs"],
      express: ["express", "expressjs", "express.js", "express framework"],
      django: ["django", "django framework", "django python"],
      flask: ["flask", "flask framework", "flask python"],
      "spring boot": ["spring boot", "spring", "spring framework", "java spring"],
      laravel: ["laravel", "laravel framework", "laravel php"],
      "ruby on rails": ["ruby on rails", "rails", "ror"],
      fastapi: ["fastapi", "fast api"],
      nestjs: ["nestjs", "nest.js", "nest"],
      
      // Mobile Development
      "android": ["android", "android development", "android app", "android programming"],
      "ios": ["ios", "ios development", "ios app", "iphone development"],
      "react native": ["react native", "react-native", "rn"],
      flutter: ["flutter", "flutter framework", "dart flutter"],
      ionic: ["ionic", "ionic framework"],
      xamarin: ["xamarin", "xamarin forms"],
      
      // Web Technologies
      html: ["html", "html5", "learn html", "hypertext markup"],
      css: ["css", "css3", "learn css", "styling", "cascading style"],
      sass: ["sass", "scss", "sass css"],
      less: ["less", "less css"],
      tailwind: ["tailwind", "tailwindcss", "tailwind css"],
      bootstrap: ["bootstrap", "bootstrap css", "bootstrap framework"],
      
      // Databases
      mongodb: ["mongodb", "mongo", "mongo db", "learn mongodb", "nosql mongo"],
      sql: ["sql", "mysql", "postgresql", "postgres", "database", "learn sql", "structured query"],
      sqlite: ["sqlite", "sqlite3"],
      redis: ["redis", "redis cache"],
      cassandra: ["cassandra", "apache cassandra"],
      dynamodb: ["dynamodb", "dynamo db", "aws dynamodb"],
      firebase: ["firebase", "firebase database", "firestore"],
      
      // Development Types
      "web development": ["web development", "web dev", "webdev", "web developer", "website development", "web programming"],
      "full stack": ["full stack", "fullstack", "mern", "mean", "mern stack", "full stack developer", "mevn"],
      "frontend": ["frontend", "front-end", "front end", "ui development", "client side"],
      "backend": ["backend", "back-end", "back end", "server side"],
      "mobile development": ["mobile development", "mobile dev", "mobile app development", "app development"],
      "game development": ["game development", "game dev", "game programming", "gaming"],
      "desktop development": ["desktop development", "desktop app", "gui development"],
      
      // Data & AI/ML
      "machine learning": ["machine learning", "ml", "ai/ml", "learn ml", "machin learnin", "machine-learning"],
      "artificial intelligence": ["artificial intelligence", "ai", "learn ai"],
      "data science": ["data science", "datascience", "ds", "data analyst", "data analysis"],
      "deep learning": ["deep learning", "neural networks", "dl", "deep-learning"],
      "data analytics": ["data analytics", "analytics", "business analytics"],
      "big data": ["big data", "bigdata", "hadoop", "spark"],
      "natural language processing": ["nlp", "natural language processing", "text processing"],
      "computer vision": ["computer vision", "cv", "image processing"],
      
      // Design & UI/UX
      "ui/ux": ["ui/ux", "ui ux", "uiux", "user interface", "user experience", "ui design", "ux design"],
      "graphic design": ["graphic design", "graphics", "visual design"],
      "web design": ["web design", "website design"],
      figma: ["figma", "figma design"],
      "adobe xd": ["adobe xd", "xd design"],
      photoshop: ["photoshop", "ps", "adobe photoshop"],
      
      // DevOps & Cloud
      devops: ["devops", "dev ops", "ci/cd", "deployment", "continuous integration"],
      docker: ["docker", "containerization", "docker container"],
      kubernetes: ["kubernetes", "k8s", "container orchestration"],
      aws: ["aws", "amazon web services", "amazon aws"],
      azure: ["azure", "microsoft azure", "azure cloud"],
      gcp: ["gcp", "google cloud", "google cloud platform"],
      jenkins: ["jenkins", "jenkins ci"],
      terraform: ["terraform", "infrastructure as code"],
      
      // Testing
      "unit testing": ["unit testing", "unit test", "testing"],
      "test automation": ["test automation", "automated testing", "qa automation"],
      selenium: ["selenium", "selenium testing"],
      jest: ["jest", "jest testing"],
      cypress: ["cypress", "cypress testing"],
      
      // Security
      cybersecurity: ["cybersecurity", "security", "cyber security", "information security"],
      "ethical hacking": ["ethical hacking", "penetration testing", "pentesting", "white hat"],
      "network security": ["network security", "network protection"],
      
      // Blockchain & Web3
      blockchain: ["blockchain", "block chain", "distributed ledger"],
      ethereum: ["ethereum", "eth", "solidity"],
      "web3": ["web3", "web 3", "web3.js"],
      
      // Version Control
      git: ["git", "github", "version control", "source control"],
      
      // Software Engineering
      "system design": ["system design", "architecture", "software architecture", "design patterns"],
      "data structures": ["data structures", "dsa", "algorithms", "data structure and algorithms"],
      "competitive programming": ["competitive programming", "cp", "coding competitions"],
      "object oriented programming": ["oop", "object oriented", "object-oriented programming"],
      
      // Business & Soft Skills
      "project management": ["project management", "pm", "agile", "scrum"],
      "digital marketing": ["digital marketing", "online marketing", "marketing"],
      "seo": ["seo", "search engine optimization"],
      "content writing": ["content writing", "copywriting", "technical writing"],
      
      // Emerging Tech
      "ar/vr": ["ar", "vr", "augmented reality", "virtual reality", "mixed reality"],
      "iot": ["iot", "internet of things", "embedded systems"],
      "quantum computing": ["quantum computing", "quantum"],
      
      // Specific Stacks
      "mern stack": ["mern", "mern stack", "mongo express react node"],
      "mean stack": ["mean", "mean stack", "mongo express angular node"],
      "lamp stack": ["lamp", "lamp stack", "linux apache mysql php"],
      "jamstack": ["jamstack", "jam stack"]
    };

    /* ================ COMPREHENSIVE LEVEL DETECTION ================ */
    const levelKeywords = {
      beginner: [
        "beginner", "begginer", "basics", "basic", "intro", "introduction", 
        "start", "starting", "new", "scratch", "fundamentals", "zero", 
        "first time", "never", "novice", "elementary", "foundation",
        "getting started", "from scratch", "for dummies"
      ],
      intermediate: [
        "intermediate", "mid level", "advance", "next level", "experienced",
        "beyond basics", "moderate", "improving", "leveling up"
      ],
      advanced: [
        "advanced", "expert", "professional", "master", "senior", "pro",
        "hardcore", "complex", "sophisticated", "elite", "ninja", "guru"
      ]
    };

    /* ================ INTENT & CONTEXT DETECTION ================ */
    const intentPatterns = {
      career: ["job", "career", "placement", "interview", "hire", "employment", "work", "salary", "fresher", "switch", "transition"],
      project: ["project", "build", "create", "make", "practical", "hands-on", "real world", "portfolio", "app"],
      academic: ["academic", "university", "college", "school", "study", "exam", "degree", "semester", "assignment"],
      freelance: ["freelance", "freelancing", "gig", "client work", "side hustle", "upwork", "fiverr"],
      certification: ["certification", "certificate", "certified", "credential", "badge"],
      hobby: ["hobby", "fun", "interest", "passion", "side project", "free time"],
      entrepreneur: ["startup", "business", "entrepreneur", "company", "saas", "product"],
      quick: ["quick", "fast", "crash course", "rapid", "speed", "bootcamp", "intensive"]
    };

    /* ================ TIME-BASED DETECTION ================ */
    const timePatterns = {
      short: ["1 hour", "2 hour", "quick", "crash", "fast", "rapid", "brief"],
      medium: ["few days", "week", "weekend", "short term"],
      long: ["months", "comprehensive", "complete", "full course", "in depth", "detailed"]
    };

    /* ================ LEARNING STYLE DETECTION ================ */
    const learningStyles = {
      video: ["video", "watch", "visual", "youtube"],
      text: ["read", "text", "article", "written", "documentation"],
      interactive: ["interactive", "hands-on", "practical", "coding", "exercise"],
      project: ["project based", "build", "create", "make"]
    };

    /* ================ COMPARISON & DECISION QUERIES ================ */
    const comparisonPatterns = [
      "vs", "versus", "or", "difference", "compare", "better", "best",
      "which", "what", "should i", "recommend", "suggest"
    ];

    /* ================ PRICE/FREE DETECTION ================ */
    const pricePatterns = {
      free: ["free", "no cost", "zero cost", "gratis", "without paying"],
      paid: ["paid", "premium", "pro", "subscription"],
      cheap: ["cheap", "affordable", "budget", "low cost", "inexpensive"]
    };

    const detectLevel = (text) => {
      const lowerText = text.toLowerCase();
      for (const [level, keywords] of Object.entries(levelKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          return level;
        }
      }
      return null;
    };

    const detectIntent = (text) => {
      const lowerText = text.toLowerCase();
      const detectedIntents = [];
      for (const [intent, patterns] of Object.entries(intentPatterns)) {
        if (patterns.some(pattern => lowerText.includes(pattern))) {
          detectedIntents.push(intent);
        }
      }
      return detectedIntents.length > 0 ? detectedIntents : ["general"];
    };

    const detectTimePreference = (text) => {
      const lowerText = text.toLowerCase();
      for (const [time, patterns] of Object.entries(timePatterns)) {
        if (patterns.some(pattern => lowerText.includes(pattern))) {
          return time;
        }
      }
      return null;
    };

    const detectLearningStyle = (text) => {
      const lowerText = text.toLowerCase();
      for (const [style, patterns] of Object.entries(learningStyles)) {
        if (patterns.some(pattern => lowerText.includes(pattern))) {
          return style;
        }
      }
      return null;
    };

    const isComparisonQuery = (text) => {
      const lowerText = text.toLowerCase();
      return comparisonPatterns.some(pattern => lowerText.includes(pattern));
    };

    const detectPricePreference = (text) => {
      const lowerText = text.toLowerCase();
      for (const [price, patterns] of Object.entries(pricePatterns)) {
        if (patterns.some(pattern => lowerText.includes(pattern))) {
          return price;
        }
      }
      return null;
    };

    /* ================ ADVANCED KEYWORD EXTRACTION ================ */
    const extractKeyword = (text) => {
      // First, try to extract the keyword after common phrases
      let cleaned = text
        .replace(/^(i want to learn|i want to|i wanna|wanna|teach me|show me|i need|looking for|find|search|learn|study|help me|suggest|guide me|what is|which is|is|the|best|good|bro|hey|yo|can you|please|kindly|how to|how do i|suggest me)\s+/gi, "")
        .replace(/\s+(course|courses|class|classes|tutorial|tutorials|lesson|lessons|for|from|as|a|an|the|with|in|on|at|to|and|or)$/gi, "")
        .replace(/\s+(course|courses|class|classes|tutorial|tutorials|lesson|lessons|on|for|about)\s+/gi, " ")
        .trim();

      // If still contains "course on" or similar, extract what comes after
      const courseOnMatch = cleaned.match(/(?:course|courses|class|classes)\s+(?:on|for|about)\s+(.+)/i);
      if (courseOnMatch && courseOnMatch[1]) {
        cleaned = courseOnMatch[1].trim();
      }

      console.log("🧹 Cleaned keyword:", cleaned);

      // Handle "C" programming - check if cleaned is just "c" or contains "c" as a standalone word
      if (cleaned === "c" || cleaned.toLowerCase() === "c" || 
          text.toLowerCase().includes("c programming") || 
          text.toLowerCase().includes("c language") ||
          /(^|\s)c(\s|$)/i.test(text)) {
        return "c programming";
      }
      if (cleaned === "cpp" || cleaned === "c++" || cleaned === "c plus plus") {
        return "c++";
      }
      if (cleaned === "ai" && !text.toLowerCase().includes("ai/ml")) {
        return "artificial intelligence";
      }
      if (cleaned === "ml") {
        return "machine learning";
      }
      if (cleaned === "ds") {
        return "data science";
      }

      const sortedMappings = Object.entries(keywordMappings).sort(
        (a, b) => b[1][0].length - a[1][0].length
      );

      // First try exact match
      for (const [standard, variations] of sortedMappings) {
        if (variations.some(v => cleaned.toLowerCase() === v.toLowerCase())) {
          console.log(`✅ Exact match found: ${cleaned} → ${standard}`);
          return standard;
        }
      }

      // Then try contains match (but be more careful)
      for (const [standard, variations] of sortedMappings) {
        for (const variation of variations) {
          const cleanedLower = cleaned.toLowerCase();
          const variationLower = variation.toLowerCase();
          // Use word boundary for better matching
          if (cleanedLower === variationLower || 
              (cleanedLower.includes(variationLower) && variationLower.length > 2)) {
            console.log(`✅ Contains match found: ${cleaned} → ${standard} (via ${variation})`);
            return standard;
          }
        }
      }

      console.log(`⚠️ No mapping found for: ${cleaned}, returning as-is`);
      return cleaned || text;
    };

    let keyword = extractKeyword(normalizedInput);
    const detectedLevel = detectLevel(normalizedInput);
    const detectedIntents = detectIntent(normalizedInput);
    const timePreference = detectTimePreference(normalizedInput);
    const learningStyle = detectLearningStyle(normalizedInput);
    const isComparison = isComparisonQuery(normalizedInput);
    const pricePreference = detectPricePreference(normalizedInput);

    console.log("🎯 Extracted Keyword:", keyword);
    console.log("📊 Detected Level:", detectedLevel);
    console.log("🎭 Detected Intents:", detectedIntents);
    console.log("⏱️ Time Preference:", timePreference);
    console.log("📚 Learning Style:", learningStyle);
    console.log("🔄 Is Comparison:", isComparison);
    console.log("💰 Price Preference:", pricePreference);

    /* ================ AI ENHANCEMENT WITH GEMINI ================ */
    if (process.env.GOOGLE_API_KEY) {
      try {
        const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = ai.getGenerativeModel({
          model: "gemini-2.0-flash-exp"
        });

        const prompt = `You are an intelligent course search query parser. Extract the MAIN learning topic/keyword from the user's query.

CRITICAL: Extract ONLY the topic the user wants to learn. If they say "python", return "python". If they say "javascript", return "javascript". Do NOT confuse similar words.

EXAMPLES:
- "suggest me course on python" → "python"
- "I want to learn python" → "python"
- "show me python courses" → "python"
- "teach me javascript" → "javascript"
- "course on java" → "java"
- "suggest me course on C" → "c programming"

SPELLING CORRECTIONS:
- "pyhton", "phyton" → "python"
- "javascirpt", "javasript" → "javascript"
- "raect" → "react"
- "machin learnin" → "machine learning"
- "begginer" → "beginner"

CASE SENSITIVITY:
- "C programming" → "c programming"
- "C++" → "c++"
- "C#" → "c#"

ABBREVIATIONS:
- "ML" → "machine learning"
- "AI" → "artificial intelligence"
- "DS" → "data science"
- "DSA" → "data structures"

User Query: "${input}"

Return ONLY the keyword in lowercase. No explanation. No quotes. Just the keyword.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiKeyword = response.text().trim().toLowerCase();

        const cleanedAiKeyword = aiKeyword
          .replace(/^(keyword|result|answer|is|the|a|an|here|topic|the keyword is|the answer is):\s*/gi, "")
          .replace(/["'`]/g, "")
          .replace(/\.$/, "")
          .trim()
          .toLowerCase();

        // Validate AI keyword - check if it makes sense
        if (cleanedAiKeyword && cleanedAiKeyword.length > 0) {
          // Check if AI keyword is reasonable (not too long, contains actual keyword)
          const originalLower = normalizedInput.toLowerCase();
          const hasPython = originalLower.includes("python");
          const hasJavascript = originalLower.includes("javascript") || originalLower.includes("js");
          const hasJava = originalLower.includes("java") && !originalLower.includes("javascript");
          
          // Validate AI didn't confuse keywords
          if (hasPython && cleanedAiKeyword.includes("javascript")) {
            console.log("⚠️ AI returned javascript but user searched for python, using extracted keyword instead");
            // Don't use AI keyword, keep the extracted one
          } else if (hasJavascript && cleanedAiKeyword.includes("python")) {
            console.log("⚠️ AI returned python but user searched for javascript, using extracted keyword instead");
            // Don't use AI keyword, keep the extracted one
          } else {
            keyword = cleanedAiKeyword;
            console.log("🤖 AI Enhanced Keyword:", keyword);
          }
        }
      } catch (aiError) {
        console.log("⚠️ AI enhancement failed:", aiError.message);
      }
    }

    /* ================ KEYWORD NORMALIZATION ================ */
    let normalizedKeyword = keyword;

    // Only normalize if keyword is not already a standard keyword
    const allStandards = Object.keys(keywordMappings);
    if (!allStandards.includes(keyword.toLowerCase())) {
      const sortedMappings = Object.entries(keywordMappings).sort(
        (a, b) => b[1][0].length - a[1][0].length
      );

      // Try exact match first
      for (const [standard, variations] of sortedMappings) {
        if (variations.some((v) => keyword.toLowerCase() === v.toLowerCase())) {
          normalizedKeyword = standard;
          console.log(`✅ Normalized: ${keyword} → ${standard} (exact match)`);
          break;
        }
      }

      // If no exact match, try contains (but be careful)
      if (normalizedKeyword === keyword) {
        for (const [standard, variations] of sortedMappings) {
          for (const variation of variations) {
            const keywordLower = keyword.toLowerCase();
            const variationLower = variation.toLowerCase();
            // Only match if variation is significant (length > 2) and keyword contains it
            if (variationLower.length > 2 && keywordLower.includes(variationLower)) {
              normalizedKeyword = standard;
              console.log(`✅ Normalized: ${keyword} → ${standard} (contains: ${variation})`);
              break;
            }
          }
          if (normalizedKeyword !== keyword) break;
        }
      }
    } else {
      normalizedKeyword = keyword.toLowerCase();
      console.log(`✅ Keyword already normalized: ${normalizedKeyword}`);
    }

    console.log("✅ Final Normalized Keyword:", normalizedKeyword);

    /* ================ INTELLIGENT QUERY BUILDER ================ */
    const buildSearchQuery = (searchTerm, level = null) => {
      const query = { isPublished: true };
      const searchPattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { title: { $regex: searchPattern, $options: "i" } },
        { subTitle: { $regex: searchPattern, $options: "i" } },
        { description: { $regex: searchPattern, $options: "i" } },
        { category: { $regex: searchPattern, $options: "i" } }
      ];

      // Special handling for "c programming" - also search for just "c" with word boundary
      if (searchTerm.toLowerCase() === "c programming") {
        query.$or.push(
          { title: { $regex: "\\bc\\b", $options: "i" } },
          { title: { $regex: "^c\\s", $options: "i" } },
          { title: { $regex: "\\sc\\s", $options: "i" } },
          { category: { $regex: "\\bc\\b", $options: "i" } }
        );
      }

      if (level) {
        query.level = { $regex: level, $options: "i" };
      }

      console.log("🔎 MongoDB Query:", JSON.stringify(query, null, 2));
      return query;
    };

    /* ================ MULTI-STAGE DATABASE SEARCH ================ */
    let courses = [];

    console.log("📍 Stage 1: Searching with normalized keyword + level");
    console.log(`🔍 Search Term: "${normalizedKeyword}"`);
    console.log(`📊 Level Filter: ${detectedLevel || "none"}`);
    courses = await Course.find(buildSearchQuery(normalizedKeyword, detectedLevel))
      .sort({ createdAt: -1 })
      .limit(50);
    console.log(`📦 Stage 1 Results: ${courses.length} courses`);
    if (courses.length > 0) {
      console.log(`📚 Found courses: ${courses.map(c => c.title).join(", ")}`);
    }

    if (courses.length === 0 && detectedLevel) {
      console.log("📍 Stage 2: Searching without level filter");
      courses = await Course.find(buildSearchQuery(normalizedKeyword))
        .sort({ createdAt: -1 })
        .limit(50);
      console.log(`📦 Stage 2 Results: ${courses.length} courses`);
    }

    if (courses.length === 0 && normalizedKeyword !== keyword) {
      console.log("📍 Stage 3: Trying original keyword");
      courses = await Course.find(buildSearchQuery(keyword))
        .sort({ createdAt: -1 })
        .limit(50);
      console.log(`📦 Stage 3 Results: ${courses.length} courses`);
    }

    if (courses.length === 0) {
      console.log("📍 Stage 4: Fallback to partial match");
      const words = normalizedInput.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length > 0) {
        const partialQuery = {
          isPublished: true,
          $or: words.flatMap(word => {
            // For single letter words like "c", use word boundary pattern
            if (word.length === 1) {
              return [
                { title: { $regex: `\\b${word}\\b`, $options: "i" } },
                { title: { $regex: `^${word}\\s`, $options: "i" } },
                { title: { $regex: `\\s${word}\\s`, $options: "i" } },
                { category: { $regex: `\\b${word}\\b`, $options: "i" } }
              ];
            }
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return [
              { title: { $regex: escaped, $options: "i" } },
              { description: { $regex: escaped, $options: "i" } },
              { category: { $regex: escaped, $options: "i" } }
            ];
          })
        };
        
        courses = await Course.find(partialQuery)
          .sort({ createdAt: -1 })
          .limit(50);
        console.log(`📦 Stage 4 Results: ${courses.length} courses`);
      }
    }
    
    // Special case: If searching for "c programming" and no results, try searching for just "c"
    if (courses.length === 0 && (normalizedKeyword === "c programming" || keyword === "c programming")) {
      console.log("📍 Stage 5: Special search for 'C' programming");
      const cQuery = {
        isPublished: true,
        $or: [
          { title: { $regex: "\\bc\\b", $options: "i" } },
          { title: { $regex: "^c\\s", $options: "i" } },
          { title: { $regex: "\\sc\\s", $options: "i" } },
          { title: { $regex: "\\bc\\s+programming", $options: "i" } },
          { category: { $regex: "\\bc\\b", $options: "i" } },
          { description: { $regex: "\\bc\\s+programming", $options: "i" } }
        ]
      };
      
      courses = await Course.find(cQuery)
        .sort({ createdAt: -1 })
        .limit(50);
      console.log(`📦 Stage 5 Results: ${courses.length} courses`);
    }

    /* ================ ADVANCED RELEVANCE SCORING ================ */
    if (courses.length > 0) {
      courses = courses.map(course => {
        let score = 0;
        const searchTermLower = normalizedKeyword.toLowerCase();
        const titleLower = (course.title || "").toLowerCase();
        const categoryLower = (course.category || "").toLowerCase();
        const descLower = (course.description || "").toLowerCase();
        
        if (titleLower === searchTermLower) score += 100;
        else if (titleLower.includes(searchTermLower)) score += 50;
        else if (titleLower.split(/\s+/).some(word => word === searchTermLower)) score += 30;
        
        if (categoryLower === searchTermLower) score += 40;
        else if (categoryLower.includes(searchTermLower)) score += 20;
        
        if (detectedLevel && course.level && course.level.toLowerCase() === detectedLevel) {
          score += 25;
        }
        
        detectedIntents.forEach(intent => {
          if (intent === "career" && descLower.includes("job")) score += 10;
          if (intent === "project" && descLower.includes("project")) score += 10;
          if (intent === "certification" && (titleLower.includes("certified") || titleLower.includes("certification"))) score += 15;
          if (intent === "quick" && (titleLower.includes("crash") || titleLower.includes("quick"))) score += 10;
        });

        if (pricePreference === "free" && course.price === 0) score += 20;
        
        if (course.rating) score += course.rating * 2;
        if (course.enrollments) score += Math.min(course.enrollments / 100, 10);
        
        return { ...course.toObject(), relevanceScore: score };
      });

      courses.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Remove relevanceScore before sending to frontend
      courses = courses.map(course => {
        const { relevanceScore, ...courseData } = course;
        return courseData;
      });
    }

    /* ================ SUGGESTED COURSES LOGIC ================ */
    let suggestedCourses = [];
    const noResultsFound = courses.length === 0;

    if (noResultsFound) {
      console.log("🔍 No exact matches found. Finding suggested courses...");

      const relatedKeywords = {
        python: ["data science", "machine learning", "web development", "programming"],
        javascript: ["web development", "react", "node.js", "typescript"],
        java: ["spring boot", "android", "programming", "backend"],
        "web development": ["html", "css", "javascript", "react", "frontend"],
        "machine learning": ["python", "data science", "artificial intelligence", "deep learning"],
        "data science": ["python", "machine learning", "data analytics", "sql"],
        react: ["javascript", "frontend", "web development", "next.js"],
        "node.js": ["javascript", "backend", "express", "web development"],
        android: ["java", "kotlin", "mobile development"],
        ios: ["swift", "mobile development"],
        "full stack": ["web development", "mern stack", "frontend", "backend"],
        "ui/ux": ["web design", "graphic design", "figma"],
        devops: ["docker", "kubernetes", "aws", "cloud"],
        aws: ["cloud", "devops", "azure"],
        mongodb: ["database", "backend", "node.js"],
        sql: ["database", "data science", "backend"]
      };

      const suggestions = relatedKeywords[normalizedKeyword] || [];
      
      if (suggestions.length > 0) {
        const suggestionQuery = {
          isPublished: true,
          $or: suggestions.flatMap(suggestion => {
            const escaped = suggestion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return [
              { title: { $regex: escaped, $options: "i" } },
              { category: { $regex: escaped, $options: "i" } },
              { description: { $regex: escaped, $options: "i" } }
            ];
          })
        };

        suggestedCourses = await Course.find(suggestionQuery)
          .sort({ createdAt: -1 })
          .limit(8);
        
        console.log(`💡 Found ${suggestedCourses.length} suggested courses`);
      }

      if (suggestedCourses.length === 0) {
        console.log("🔥 Getting popular courses as suggestions");
        suggestedCourses = await Course.find({ isPublished: true })
          .sort({ createdAt: -1 })
          .limit(8);
      }
    }

    /* ================ RESPONSE WITH NOT FOUND MESSAGE ================ */
    console.log(`✅ Final Results: ${courses.length} courses found`);
    
    // If no courses found, return object with message and suggested courses
    if (courses.length === 0) {
      return res.status(200).json({
        found: false,
        message: `No courses found for "${input}". Here are some courses you might be interested in:`,
        searchedFor: normalizedKeyword,
        courses: [],
        suggestedCourses: suggestedCourses || []
      });
    }

    // Return object with found courses
    return res.status(200).json({
      found: true,
      courses: courses,
      suggestedCourses: []
    });

  } catch (error) {
    console.error("❌ Search error:", error);
    return res.status(500).json({
      message: "Search failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};