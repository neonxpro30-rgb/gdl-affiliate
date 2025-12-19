// Indian Festival Calendar 2024-2025
// Used for automated social media content generation

export interface Festival {
    name: string;
    date: string; // MM-DD format
    type: 'national' | 'religious' | 'cultural';
    greeting: string;
    hashtags: string[];
}

// Festivals are stored in MM-DD format for easy matching
export const festivals: Festival[] = [
    // January
    {
        name: "New Year",
        date: "01-01",
        type: "cultural",
        greeting: "Happy New Year! 🎉 Start this year with new goals and new skills. Your growth journey begins at LearnPeak.",
        hashtags: ["HappyNewYear", "NewYear2025", "NewBeginnings", "LearnPeak"]
    },
    {
        name: "Republic Day",
        date: "01-26",
        type: "national",
        greeting: "Happy Republic Day! 🇮🇳 Celebrate freedom by building your own path to financial independence. Your learning journey starts at LearnPeak.",
        hashtags: ["RepublicDay", "India", "ProudIndian", "LearnPeak"]
    },

    // February
    {
        name: "Valentine's Day",
        date: "02-14",
        type: "cultural",
        greeting: "Happy Valentine's Day! 💕 Fall in love with learning. Build skills that create real value. Start at LearnPeak.",
        hashtags: ["ValentinesDay", "LoveYourself", "SelfGrowth", "LearnPeak"]
    },

    // March
    {
        name: "Holi",
        date: "03-14",
        type: "religious",
        greeting: "Happy Holi! 🎨 Add colors of success to your life. Learn digital skills and grow with LearnPeak.",
        hashtags: ["HappyHoli", "Holi2025", "FestivalOfColors", "LearnPeak"]
    },

    // April
    {
        name: "Baisakhi",
        date: "04-13",
        type: "religious",
        greeting: "Happy Baisakhi! 🌾 Harvest season is here. Time to reap the rewards of your efforts. Start learning at LearnPeak.",
        hashtags: ["HappyBaisakhi", "Baisakhi2025", "LearnPeak"]
    },
    {
        name: "Ambedkar Jayanti",
        date: "04-14",
        type: "national",
        greeting: "Remembering Dr. B.R. Ambedkar on his Jayanti. Education is the foundation of progress. Keep learning with LearnPeak.",
        hashtags: ["AmbedkarJayanti", "Education", "LearnPeak"]
    },

    // May
    {
        name: "Labour Day",
        date: "05-01",
        type: "national",
        greeting: "Happy Labour Day! 💪 Your hard work deserves smart strategies. Learn to work smarter with LearnPeak.",
        hashtags: ["LabourDay", "MayDay", "WorkSmart", "LearnPeak"]
    },

    // June
    {
        name: "World Environment Day",
        date: "06-05",
        type: "cultural",
        greeting: "Happy World Environment Day! 🌍 Sustainable growth matters - both for our planet and your career. Grow with LearnPeak.",
        hashtags: ["WorldEnvironmentDay", "Sustainability", "Growth", "LearnPeak"]
    },

    // July
    {
        name: "Guru Purnima",
        date: "07-21",
        type: "religious",
        greeting: "Happy Guru Purnima! 🙏 Honor the spirit of learning. Every skill you master opens new doors. Learn at LearnPeak.",
        hashtags: ["GuruPurnima", "Gratitude", "Learning", "LearnPeak"]
    },

    // August
    {
        name: "Independence Day",
        date: "08-15",
        type: "national",
        greeting: "Happy Independence Day! 🇮🇳 Build your financial freedom with the right skills. Your independence starts at LearnPeak.",
        hashtags: ["IndependenceDay", "India", "Freedom", "LearnPeak"]
    },
    {
        name: "Raksha Bandhan",
        date: "08-09",
        type: "religious",
        greeting: "Happy Raksha Bandhan! 🎀 Protect your future with the right skills. Start learning at LearnPeak.",
        hashtags: ["RakshaBandhan", "Siblings", "Love", "LearnPeak"]
    },
    {
        name: "Janmashtami",
        date: "08-26",
        type: "religious",
        greeting: "Happy Janmashtami! 🦚 May Lord Krishna bless you with wisdom. Keep learning, keep growing with LearnPeak.",
        hashtags: ["Janmashtami", "Krishna", "Wisdom", "LearnPeak"]
    },

    // September
    {
        name: "Teacher's Day",
        date: "09-05",
        type: "national",
        greeting: "Happy Teacher's Day! 📚 Thank you to all teachers who shape our future. Education transforms lives. Learn at LearnPeak.",
        hashtags: ["TeachersDay", "ThankYouTeachers", "Education", "LearnPeak"]
    },
    {
        name: "Ganesh Chaturthi",
        date: "09-07",
        type: "religious",
        greeting: "Ganpati Bappa Morya! 🙏 May Lord Ganesha remove all obstacles from your path. Start your journey at LearnPeak.",
        hashtags: ["GaneshChaturthi", "GanpatiBappaMorya", "LearnPeak"]
    },

    // October
    {
        name: "Gandhi Jayanti",
        date: "10-02",
        type: "national",
        greeting: "Remembering Mahatma Gandhi on his Jayanti. Be the change you wish to see. Start your transformation at LearnPeak.",
        hashtags: ["GandhiJayanti", "BeTheChange", "LearnPeak"]
    },
    {
        name: "Navratri Begins",
        date: "10-03",
        type: "religious",
        greeting: "Happy Navratri! 🙏 Nine nights of divine energy. Channel your energy into building new skills. Learn at LearnPeak.",
        hashtags: ["Navratri", "JaiMataDi", "LearnPeak"]
    },
    {
        name: "Dussehra",
        date: "10-12",
        type: "religious",
        greeting: "Happy Dussehra! 🏹 Victory of good over evil. Win over your doubts and start learning today at LearnPeak.",
        hashtags: ["HappyDussehra", "Vijayadashami", "Victory", "LearnPeak"]
    },

    // November
    {
        name: "Diwali",
        date: "11-01",
        type: "religious",
        greeting: "Happy Diwali! 🪔 May this festival of lights illuminate your path to success. Brighten your future with LearnPeak.",
        hashtags: ["HappyDiwali", "Diwali2025", "FestivalOfLights", "LearnPeak"]
    },
    {
        name: "Bhai Dooj",
        date: "11-03",
        type: "religious",
        greeting: "Happy Bhai Dooj! 👫 Celebrate the bond of siblings. Share the gift of knowledge. Learn together at LearnPeak.",
        hashtags: ["BhaiDooj", "Siblings", "LearnPeak"]
    },
    {
        name: "Children's Day",
        date: "11-14",
        type: "national",
        greeting: "Happy Children's Day! 🎈 Learning never stops at any age. Stay curious and keep growing with LearnPeak.",
        hashtags: ["ChildrensDay", "StayCurious", "NeverStopLearning", "LearnPeak"]
    },
    {
        name: "Guru Nanak Jayanti",
        date: "11-15",
        type: "religious",
        greeting: "Happy Guru Nanak Jayanti! 🙏 His teachings inspire us to help others and keep learning. Grow with LearnPeak.",
        hashtags: ["GuruNanakJayanti", "Sikh", "LearnPeak"]
    },

    // December
    {
        name: "Christmas",
        date: "12-25",
        type: "cultural",
        greeting: "Merry Christmas! 🎄 Gift yourself the best present - knowledge. Start learning at LearnPeak.",
        hashtags: ["MerryChristmas", "Christmas2025", "GiftOfKnowledge", "LearnPeak"]
    },
    {
        name: "New Year's Eve",
        date: "12-31",
        type: "cultural",
        greeting: "End this year with gratitude and welcome the new one with ambition. Your growth story continues at LearnPeak.",
        hashtags: ["NewYearsEve", "Goodbye2025", "Welcome2026", "LearnPeak"]
    }
];

// Check if today is a festival
export function getTodaysFestival(): Festival | null {
    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return festivals.find(f => f.date === todayFormatted) || null;
}

// Get upcoming festivals (next 7 days)
export function getUpcomingFestivals(days: number = 7): Festival[] {
    const today = new Date();
    const upcoming: Festival[] = [];

    for (let i = 0; i <= days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateFormatted = `${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

        const festival = festivals.find(f => f.date === dateFormatted);
        if (festival) {
            upcoming.push(festival);
        }
    }

    return upcoming;
}
