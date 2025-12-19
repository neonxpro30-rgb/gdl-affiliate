// Content Templates for Daily Social Media Posts
// Professional, English-only, Growth-focused

export interface ContentTemplate {
    id: string;
    category: 'motivation' | 'tip' | 'wisdom' | 'earning' | 'feature' | 'success' | 'special';
    dayOfWeek?: number; // 0=Sunday, 1=Monday, etc.
    caption: string;
    hashtags: string[];
}

// Day-based content themes
// Monday (1) = Motivation
// Tuesday (2) = Tips
// Wednesday (3) = Wisdom
// Thursday (4) = Earning
// Friday (5) = Feature
// Saturday (6) = Success Stories
// Sunday (0) = Special/Recap

export const contentTemplates: ContentTemplate[] = [
    // MONDAY - Motivation
    {
        id: "mon-1",
        category: "motivation",
        dayOfWeek: 1,
        caption: "Monday mindset: Small steps lead to big results.\n\nDon't wait for the perfect moment. Start now, learn daily, and watch yourself grow.\n\nYour skill-building journey starts at LearnPeak.\nLink in bio 👆",
        hashtags: ["MondayMotivation", "GrowthMindset", "LearnPeak", "DigitalSkills"]
    },
    {
        id: "mon-2",
        category: "motivation",
        dayOfWeek: 1,
        caption: "New week. New goals. New opportunities.\n\nThe best investment you can make is in yourself. Learn skills that open doors.\n\nStart your journey at LearnPeak.\nLink in bio 👆",
        hashtags: ["MondayMotivation", "NewWeek", "SelfInvestment", "LearnPeak"]
    },
    {
        id: "mon-3",
        category: "motivation",
        dayOfWeek: 1,
        caption: "Success is not a destination. It's a journey of consistent effort.\n\nThis week, commit to learning something new every day.\n\nLearnPeak can help. Link in bio 👆",
        hashtags: ["MondayMotivation", "Consistency", "Learning", "LearnPeak"]
    },
    {
        id: "mon-4",
        category: "motivation",
        dayOfWeek: 1,
        caption: "Your future self will thank you for starting today.\n\nEvery skill you learn is a tool in your toolkit. Build your arsenal with LearnPeak.\n\nLink in bio 👆",
        hashtags: ["MondayMotivation", "FuturePlanning", "SkillBuilding", "LearnPeak"]
    },

    // TUESDAY - Tips
    {
        id: "tue-1",
        category: "tip",
        dayOfWeek: 2,
        caption: "Tip Tuesday 💡\n\nWant to succeed in affiliate marketing? Focus on providing value first. The sales will follow.\n\nLearn proven strategies at LearnPeak.\nLink in bio 👆",
        hashtags: ["TipTuesday", "AffiliateMarketing", "ValueFirst", "LearnPeak"]
    },
    {
        id: "tue-2",
        category: "tip",
        dayOfWeek: 2,
        caption: "Tip Tuesday 💡\n\nContent is king, but consistency is the kingdom.\n\nPost regularly, engage genuinely, and watch your audience grow.\n\nFree resources at LearnPeak. Link in bio 👆",
        hashtags: ["TipTuesday", "ContentCreation", "Consistency", "LearnPeak"]
    },
    {
        id: "tue-3",
        category: "tip",
        dayOfWeek: 2,
        caption: "Tip Tuesday 💡\n\nDon't just scroll. Create.\n\nEvery hour you spend creating > every hour you spend consuming.\n\nStart creating with LearnPeak. Link in bio 👆",
        hashtags: ["TipTuesday", "CreatorTips", "ContentCreation", "LearnPeak"]
    },
    {
        id: "tue-4",
        category: "tip",
        dayOfWeek: 2,
        caption: "Tip Tuesday 💡\n\nThe best time to start was yesterday. The next best time is today.\n\nStop overthinking. Start learning.\n\nLearnPeak makes it easy. Link in bio 👆",
        hashtags: ["TipTuesday", "StartToday", "NoExcuses", "LearnPeak"]
    },

    // WEDNESDAY - Wisdom
    {
        id: "wed-1",
        category: "wisdom",
        dayOfWeek: 3,
        caption: "Wisdom Wednesday 📚\n\n\"An investment in knowledge pays the best interest.\" - Benjamin Franklin\n\nInvest in yourself today at LearnPeak.\nLink in bio 👆",
        hashtags: ["WisdomWednesday", "KnowledgeIsPower", "LearnPeak", "Quotes"]
    },
    {
        id: "wed-2",
        category: "wisdom",
        dayOfWeek: 3,
        caption: "Wisdom Wednesday 📚\n\nDon't work hard in the wrong direction. Strategy + Effort = Results.\n\nLearn the right strategies at LearnPeak.\nLink in bio 👆",
        hashtags: ["WisdomWednesday", "WorkSmart", "Strategy", "LearnPeak"]
    },
    {
        id: "wed-3",
        category: "wisdom",
        dayOfWeek: 3,
        caption: "Wisdom Wednesday 📚\n\nSkills depreciate. Keep learning.\n\nWhat got you here won't get you there. Upgrade yourself constantly.\n\nLearnPeak can help. Link in bio 👆",
        hashtags: ["WisdomWednesday", "ContinuousLearning", "Upgrade", "LearnPeak"]
    },
    {
        id: "wed-4",
        category: "wisdom",
        dayOfWeek: 3,
        caption: "Wisdom Wednesday 📚\n\nYour network is your net worth. But your skills determine how far you go.\n\nBuild skills that matter at LearnPeak.\nLink in bio 👆",
        hashtags: ["WisdomWednesday", "SkillsMatter", "Growth", "LearnPeak"]
    },

    // THURSDAY - Earning
    {
        id: "thu-1",
        category: "earning",
        dayOfWeek: 4,
        caption: "Building a side income isn't luck. It's a skill.\n\nAffiliate marketing is one of the most accessible ways to start.\n\nLearn the fundamentals at LearnPeak.\nLink in bio 👆",
        hashtags: ["SideIncome", "AffiliateMarketing", "FinancialFreedom", "LearnPeak"]
    },
    {
        id: "thu-2",
        category: "earning",
        dayOfWeek: 4,
        caption: "Your 9-5 builds someone else's dream.\n\nYour side hustle builds yours.\n\nLearn to build your own income streams at LearnPeak.\nLink in bio 👆",
        hashtags: ["SideHustle", "IncomeStreams", "Entrepreneurship", "LearnPeak"]
    },
    {
        id: "thu-3",
        category: "earning",
        dayOfWeek: 4,
        caption: "The internet has created more opportunities than ever before.\n\nAre you taking advantage of them?\n\nStart learning digital skills at LearnPeak.\nLink in bio 👆",
        hashtags: ["DigitalOpportunity", "OnlineIncome", "LearnPeak", "DigitalSkills"]
    },
    {
        id: "thu-4",
        category: "earning",
        dayOfWeek: 4,
        caption: "Multiple income streams = Financial security.\n\nDon't depend on just one source. Learn to diversify.\n\nLearnPeak shows you how. Link in bio 👆",
        hashtags: ["MultipleIncomes", "FinancialSecurity", "Diversify", "LearnPeak"]
    },

    // FRIDAY - Feature
    {
        id: "fri-1",
        category: "feature",
        dayOfWeek: 5,
        caption: "Weekend is coming. Perfect time to learn something new.\n\nExplore our courses on affiliate marketing, content creation, and more.\n\nCheck out LearnPeak. Link in bio 👆",
        hashtags: ["WeekendLearning", "OnlineCourses", "LearnPeak", "SkillBuilding"]
    },
    {
        id: "fri-2",
        category: "feature",
        dayOfWeek: 5,
        caption: "What will you learn this weekend?\n\n📱 Social Media Marketing\n💰 Affiliate Marketing\n🎥 Content Creation\n📈 Growth Strategies\n\nAll at LearnPeak. Link in bio 👆",
        hashtags: ["WeekendGoals", "OnlineLearning", "LearnPeak", "Courses"]
    },
    {
        id: "fri-3",
        category: "feature",
        dayOfWeek: 5,
        caption: "Your skills are your most valuable asset.\n\nUpgrade them every weekend. Stay ahead of the curve.\n\nExplore courses at LearnPeak. Link in bio 👆",
        hashtags: ["SkillUpgrade", "WeekendMode", "LearnPeak", "Growth"]
    },
    {
        id: "fri-4",
        category: "feature",
        dayOfWeek: 5,
        caption: "TGIF! 🎉\n\nBut remember: Successful people work when others rest.\n\nUse this weekend to level up. LearnPeak has everything you need.\nLink in bio 👆",
        hashtags: ["TGIF", "WeekendGrind", "SuccessMindset", "LearnPeak"]
    },

    // SATURDAY - Success
    {
        id: "sat-1",
        category: "success",
        dayOfWeek: 6,
        caption: "Every expert was once a beginner.\n\nDon't compare your chapter 1 to someone else's chapter 20.\n\nStart your chapter at LearnPeak. Link in bio 👆",
        hashtags: ["SaturdaySuccess", "BeginnerMindset", "Growth", "LearnPeak"]
    },
    {
        id: "sat-2",
        category: "success",
        dayOfWeek: 6,
        caption: "Success leaves clues.\n\nLearn from those who've done it. Apply it to your journey.\n\nReal strategies at LearnPeak. Link in bio 👆",
        hashtags: ["SaturdaySuccess", "LearnFromTheBest", "Strategy", "LearnPeak"]
    },
    {
        id: "sat-3",
        category: "success",
        dayOfWeek: 6,
        caption: "Behind every overnight success is years of consistent effort.\n\nThere are no shortcuts. Just smart work and persistence.\n\nLearnPeak guides you. Link in bio 👆",
        hashtags: ["SaturdaySuccess", "Consistency", "NoShortcuts", "LearnPeak"]
    },
    {
        id: "sat-4",
        category: "success",
        dayOfWeek: 6,
        caption: "Your only competition is who you were yesterday.\n\nBe 1% better every day. That's 365% better in a year.\n\nGrow with LearnPeak. Link in bio 👆",
        hashtags: ["SaturdaySuccess", "1PercentBetter", "Growth", "LearnPeak"]
    },

    // SUNDAY - Special
    {
        id: "sun-1",
        category: "special",
        dayOfWeek: 0,
        caption: "Sunday Reset 🔄\n\nReflect on this week. Plan the next one.\n\nWhat's one skill you'll focus on? Tell us in the comments.\n\nStart learning at LearnPeak. Link in bio 👆",
        hashtags: ["SundayReset", "WeeklyReview", "Planning", "LearnPeak"]
    },
    {
        id: "sun-2",
        category: "special",
        dayOfWeek: 0,
        caption: "Rest, recharge, and get ready.\n\nA new week means new opportunities to grow.\n\nMake this week count. LearnPeak is here to help.\nLink in bio 👆",
        hashtags: ["SundayVibes", "Recharge", "NewWeek", "LearnPeak"]
    },
    {
        id: "sun-3",
        category: "special",
        dayOfWeek: 0,
        caption: "Take a moment to appreciate how far you've come.\n\nBut don't stop. There's still so much to learn and achieve.\n\nKeep growing with LearnPeak. Link in bio 👆",
        hashtags: ["SundayReflection", "Gratitude", "KeepGoing", "LearnPeak"]
    },
    {
        id: "sun-4",
        category: "special",
        dayOfWeek: 0,
        caption: "Sundays are for planning your success.\n\nWhat courses will you complete this week? What skills will you build?\n\nPlan your growth at LearnPeak. Link in bio 👆",
        hashtags: ["SundayPlanning", "WeekAhead", "Goals", "LearnPeak"]
    }
];

// Get a random template for a specific day
export function getTemplateForDay(dayOfWeek: number): ContentTemplate {
    const dayTemplates = contentTemplates.filter(t => t.dayOfWeek === dayOfWeek);
    const randomIndex = Math.floor(Math.random() * dayTemplates.length);
    return dayTemplates[randomIndex];
}

// Get template by category
export function getTemplateByCategory(category: ContentTemplate['category']): ContentTemplate {
    const categoryTemplates = contentTemplates.filter(t => t.category === category);
    const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
    return categoryTemplates[randomIndex];
}
