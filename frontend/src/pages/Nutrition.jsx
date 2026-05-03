import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Leaf, Beef, Flame, Zap, ShoppingCart, RefreshCw, ChevronRight, Apple, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const mealLibrary = {
  vegetarian: [
    { name: "Greek Yogurt Bowl", calories: 350, protein: 25, carbs: 40, fat: 10, type: "Breakfast", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800" },
    { name: "Avocado Sourdough Toast", calories: 400, protein: 12, carbs: 45, fat: 22, type: "Breakfast", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800" },
    { name: "Quinoa Buddha Bowl", calories: 550, protein: 18, carbs: 70, fat: 25, type: "Lunch", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer Tikka Salad", calories: 500, protein: 28, carbs: 15, fat: 35, type: "Lunch", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800" },
    { name: "Lentil Pasta with Spinach", calories: 600, protein: 25, carbs: 85, fat: 12, type: "Dinner", image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
    { name: "Sweet Potato Chickpea Curry", calories: 580, protein: 15, carbs: 90, fat: 18, type: "Dinner", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800" }
  ],
  nonVegetarian: [
    { name: "Omelette with Salmon", calories: 450, protein: 35, carbs: 5, fat: 30, type: "Breakfast", image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=800" },
    { name: "Berry Protein Smoothie", calories: 380, protein: 40, carbs: 35, fat: 8, type: "Breakfast", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=800" },
    { name: "Grilled Chicken & Rice", calories: 600, protein: 45, carbs: 65, fat: 12, type: "Lunch", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800" },
    { name: "Tuna Steak", calories: 520, protein: 50, carbs: 10, fat: 28, type: "Lunch", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
    { name: "Beef & Broccoli Stir Fry", calories: 650, protein: 40, carbs: 30, fat: 42, type: "Dinner", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
    { name: "Lemon Butter Salmon", calories: 620, protein: 38, carbs: 8, fat: 48, type: "Dinner", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800" }
  ]
};

const Nutrition = () => {
  const { user } = useAuth();
  const [dietType, setDietType] = useState('vegetarian');
  const [targetCalories, setTargetCalories] = useState(2000);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Calculate TDEE: 10 * weight + 6.25 * height - 5 * age + (5 for male, -161 for female)
    if (user) {
      let bmr = (10 * user.weight) + (6.25 * (user.height || 175)) - (5 * user.age);
      bmr = user.gender === 'Male' ? bmr + 5 : bmr - 161;
      const tdee = Math.round(bmr * 1.5); // Moderate activity factor
      
      // Goal adjustment
      const goal = user.fitnessGoals?.[0]?.toLowerCase() || 'maintain';
      if (goal.includes('loss') || goal.includes('cutting')) setTargetCalories(tdee - 500);
      else if (goal.includes('gain') || goal.includes('bulking')) setTargetCalories(tdee + 500);
      else setTargetCalories(tdee);
    }
  }, [user]);

  const generatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const meals = mealLibrary[dietType];
      const breakfast = meals.filter(m => m.type === "Breakfast")[Math.floor(Math.random() * 2)];
      const lunch = meals.filter(m => m.type === "Lunch")[Math.floor(Math.random() * 2)];
      const dinner = meals.filter(m => m.type === "Dinner")[Math.floor(Math.random() * 2)];
      
      setDailyPlan([breakfast, lunch, dinner]);
      setIsGenerating(false);
    }, 1000);
  };

  useEffect(() => {
    if (user) generatePlan();
  }, [user, dietType]);

  const totalMacros = dailyPlan.reduce((acc, meal) => ({
    cal: acc.cal + meal.calories,
    pro: acc.pro + meal.protein,
    carb: acc.carb + meal.carbs,
    fat: acc.fat + meal.fat
  }), { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div className="main-content">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="dashboard-title">Smart Nutrition AI</h1>
          <p className="dashboard-subtitle">Fueling your FitQuest with optimized meal planning.</p>
        </div>
        
        {/* Diet Toggle */}
        <div className="glass" style={{ display: 'flex', padding: '6px', gap: '8px', borderRadius: '16px' }}>
           <motion.button 
             onClick={() => setDietType('vegetarian')}
             style={{ background: dietType === 'vegetarian' ? '#ecfdf5' : 'transparent', color: dietType === 'vegetarian' ? '#10b981' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
           >
              <Leaf size={18} /> Veg
           </motion.button>
           <motion.button 
             onClick={() => setDietType('nonVegetarian')}
             style={{ background: dietType === 'nonVegetarian' ? '#fff1f2' : 'transparent', color: dietType === 'nonVegetarian' ? '#f43f5e' : '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
           >
              <Beef size={18} /> Non-Veg
           </motion.button>
        </div>
      </header>

      {/* Target Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
         <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Target</p>
            <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{targetCalories} <span style={{ fontSize: '14px', opacity: 0.5 }}>kcal</span></h4>
         </div>
         <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Plan Calories</p>
            <h4 style={{ fontSize: '24px', fontWeight: '900', color: totalMacros.cal > targetCalories ? '#f43f5e' : '#10b981' }}>{totalMacros.cal} <span style={{ fontSize: '14px', opacity: 0.5 }}>kcal</span></h4>
         </div>
         <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Protein Target</p>
            <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>{totalMacros.pro}g</h4>
         </div>
         <div className="glass" style={{ padding: '24px', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Goal Mode</p>
            <h4 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'capitalize' }}>{user?.fitnessGoals?.[0] || 'Active'}</h4>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '40px' }}>
         {/* Meal List */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AnimatePresence mode='wait'>
               {isGenerating ? (
                 <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}
                 >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                       <RefreshCw size={48} color="var(--primary)" />
                    </motion.div>
                    <p style={{ fontWeight: '800', color: '#94a3b8' }}>Generating your perfect meal plan...</p>
                 </motion.div>
               ) : (
                 <motion.div key="meals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {dailyPlan.map((meal, idx) => (
                      <motion.div 
                        key={meal.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass" 
                        style={{ display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden', padding: '0' }}
                      >
                         <div style={{ height: '200px' }}>
                            <img src={meal.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                         </div>
                         <div style={{ padding: '32px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                               <div>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{meal.type}</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b' }}>{meal.name}</h3>
                               </div>
                               <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{meal.calories}</p>
                                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>CALORIES</p>
                               </div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px' }}>
                               <div>
                                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>PROTEIN</p>
                                  <p style={{ fontSize: '16px', fontWeight: '900', color: '#10b981' }}>{meal.protein}g</p>
                               </div>
                               <div>
                                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>CARBS</p>
                                  <p style={{ fontSize: '16px', fontWeight: '900', color: '#f59e0b' }}>{meal.carbs}g</p>
                               </div>
                               <div>
                                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>FATS</p>
                                  <p style={{ fontSize: '16px', fontWeight: '900', color: '#f43f5e' }}>{meal.fat}g</p>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Right Column: Nutrition Tips */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass" style={{ padding: '32px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: 'white' }}>
               <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>Macro Balance</h3>
               <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
                 Your current plan is high in protein which is perfect for muscle recovery.
               </p>
               <button onClick={generatePlan} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'white', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <RefreshCw size={18} /> Refresh Plan
               </button>
            </div>

            <div className="glass" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Apple size={18} color="#10b981" /> Pro Tips
               </h3>
               <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'flex', gap: '12px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0 }} />
                     Drink 500ml water before every meal.
                  </li>
                  <li style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'flex', gap: '12px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0 }} />
                     Chew your food slowly for better digestion.
                  </li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Nutrition;
