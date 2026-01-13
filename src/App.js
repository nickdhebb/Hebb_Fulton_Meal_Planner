import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Download, ChefHat, ShoppingCart, Users, Edit2 } from 'lucide-react';
import * as mammoth from 'mammoth';

const RecipeForm = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    recipe || { name: "", cuisine: "Other", servings: 4, ingredients: [] }
  );

  const [ingredient, setIngredient] = useState({
    amount: "",
    unit: "",
    name: ""
  });

  const addIngredient = () => {
    if (!ingredient.name.trim()) return;
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredient]
    });
    setIngredient({ amount: "", unit: "", name: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 space-y-6">

        <h2 className="text-2xl font-semibold">
          {recipe ? "Edit Recipe" : "Add Recipe"}
        </h2>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-lg p-3"
            placeholder="Recipe name"
            value={formData.name}
            onChange={e =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <select
            className="border rounded-lg p-3"
            value={formData.cuisine}
            onChange={e =>
              setFormData({ ...formData, cuisine: e.target.value })
            }
          >
            {["Italian","Mexican","Asian","American","Mediterranean","Indian","French","Other"]
              .map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <input
          type="number"
          min="1"
          className="border rounded-lg p-3 w-32"
          value={formData.servings}
          onChange={e =>
            setFormData({ ...formData, servings: +e.target.value })
          }
        />

        {/* Ingredients */}
        <div className="space-y-3">
          <h3 className="font-medium">Ingredients</h3>

          {formData.ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between bg-gray-50 p-3 rounded-lg">
              <span>{ing.amount} {ing.unit} {ing.name}</span>
              <button
                className="text-red-500"
                onClick={() =>
                  setFormData({
                    ...formData,
                    ingredients: formData.ingredients.filter((_, idx) => idx !== i)
                  })
                }
              >
                ✕
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              placeholder="Amount"
              className="border p-2 rounded w-20"
              value={ingredient.amount}
              onChange={e => setIngredient({ ...ingredient, amount: e.target.value })}
            />
            <input
              placeholder="Unit"
              className="border p-2 rounded w-24"
              value={ingredient.unit}
              onChange={e => setIngredient({ ...ingredient, unit: e.target.value })}
            />
            <input
              placeholder="Ingredient"
              className="border p-2 rounded flex-1"
              value={ingredient.name}
              onChange={e => setIngredient({ ...ingredient, name: e.target.value })}
            />
            <button
              onClick={addIngredient}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const MealPlannerApp = () => {
  const [recipes, setRecipes] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [activeTab, setActiveTab] = useState('recipes');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [newGroceryItem, setNewGroceryItem] = useState({ name: '', amount: '', department: 'Other' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const recipesData = await window.storage.get('recipes');
      const planData = await window.storage.get('weeklyPlan');
      const pantryData = await window.storage.get('pantryItems');

      if (recipesData) setRecipes(JSON.parse(recipesData.value));
      if (planData) setWeeklyPlan(JSON.parse(planData.value));
      if (pantryData) setPantryItems(JSON.parse(pantryData.value));
    } catch (error) {
      console.log('No saved data found');
    }
  };

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  useEffect(() => {
    if (recipes.length > 0) saveData('recipes', recipes);
  }, [recipes]);

  useEffect(() => {
    if (weeklyPlan.length > 0) saveData('weeklyPlan', weeklyPlan);
  }, [weeklyPlan]);

  useEffect(() => {
    saveData('pantryItems', pantryItems);
  }, [pantryItems]);

  const fractionToDecimal = (str) => {
    if (!str) return 0;
    
    // Trim whitespace
    let cleaned = str.toString().trim();
    
    // Handle unicode fractions
    const unicodeFractions = {
      '¼': 0.25, '½': 0.5, '¾': 0.75,
      '⅐': 0.142857, '⅑': 0.111111, '⅒': 0.1,
      '⅓': 0.333333, '⅔': 0.666667,
      '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
      '⅙': 0.166667, '⅚': 0.833333,
      '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
    };
    
    // Check for mixed numbers with unicode fractions first (e.g., "2½")
    const mixedUnicodeMatch = cleaned.match(/^(\d+)(¼|½|¾|⅐|⅑|⅒|⅓|⅔|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)$/);
    if (mixedUnicodeMatch) {
      const whole = parseFloat(mixedUnicodeMatch[1]);
      const frac = unicodeFractions[mixedUnicodeMatch[2]];
      return whole + frac;
    }
    
    // Replace standalone unicode fractions with decimals
    for (const [frac, dec] of Object.entries(unicodeFractions)) {
      if (cleaned === frac) return dec;
      cleaned = cleaned.replace(frac, ` ${dec}`);
    }
    
    // Handle mixed numbers with text fractions (e.g., "1 1/2" or "2 1/4")
    const mixedTextMatch = cleaned.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixedTextMatch) {
      const whole = parseFloat(mixedTextMatch[1]);
      const numerator = parseFloat(mixedTextMatch[2]);
      const denominator = parseFloat(mixedTextMatch[3]);
      return whole + (numerator / denominator);
    }
    
    // Handle simple text fractions (e.g., "1/2" or "3/4")
    const fractionMatch = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (fractionMatch) {
      const numerator = parseFloat(fractionMatch[1]);
      const denominator = parseFloat(fractionMatch[2]);
      return numerator / denominator;
    }
    
    // Handle space-separated numbers from unicode replacement (e.g., "2 0.5" from "2½")
    const spacedMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
    if (spacedMatch) {
      return parseFloat(spacedMatch[1]) + parseFloat(spacedMatch[2]);
    }
    
    // Handle regular decimals
    return parseFloat(cleaned) || 0;
  };

  const extractIngredientsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const ingredients = [];

    lines.forEach(line => {
      const match = line.match(/^[\d\s\/.-]*\s*([a-zA-Z]+)?\s*(.+)/);
      if (match) {
        const amountStr = line.match(/[\d\s\/.-]+/)?.[0]?.trim() || '1';
        const amount = fractionToDecimal(amountStr).toString();
        const unit = line.match(/\b(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|clove|cloves|head|piece|bunch|tablespoon|tablespoons|teaspoon|teaspoons|pound|pounds|ounce|ounces)\b/i)?.[0] || '';
        const name = match[2].replace(unit, '').trim();

        if (name.length > 2) {
          ingredients.push({ amount, unit, name });
        }
      }
    });

    return ingredients;
  };

const response = await fetch("/api/extract-recipe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ base64Data })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "PDF extraction failed");
}

const newRecipe = {
  id: Date.now(),
  name: file.name.replace(".pdf", ""),
  cuisine: data.cuisine,
  ingredients: data.ingredients.length
    ? data.ingredients
    : [{ amount: "", unit: "", name: "Add ingredients manually" }],
  servings: data.servings,
  baseServings: data.servings,
  baseIngredients: data.ingredients,
  lastUsed: null
};

setEditingRecipe(newRecipe);
setShowAddRecipe(true);


        const newRecipe = {
          id: Date.now(),
          name: file.name.replace('.pdf', ''),
          cuisine: extractedData.cuisine || 'Other',
          ingredients: extractedData.ingredients.length > 0 ? extractedData.ingredients : [{ amount: '1', unit: '', name: 'Extraction failed - add manually' }],
          servings: extractedData.servings || 4,
          baseServings: extractedData.servings || 4,
          baseIngredients: extractedData.ingredients.length > 0 ? extractedData.ingredients : [{ amount: '1', unit: '', name: 'Extraction failed - add manually' }],
          lastUsed: null
        };

        setEditingRecipe(newRecipe);
        setShowAddRecipe(true);
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const ingredients = extractIngredientsFromText(result.value);

        setEditingRecipe({
          id: Date.now(),
          name: file.name.replace('.docx', ''),
          cuisine: 'Other',
          ingredients: ingredients.length > 0 ? ingredients : [{ amount: '1', unit: '', name: 'Extraction failed' }],
          servings: 4,
          baseServings: 4,
          baseIngredients: ingredients.length > 0 ? ingredients : [{ amount: '1', unit: '', name: 'Extraction failed' }],
          lastUsed: null
        });
        setShowAddRecipe(true);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    e.target.value = '';
  };

  const addOrUpdateRecipe = (recipe) => {
    const recipeWithBase = {
      ...recipe,
      baseServings: recipe.baseServings || recipe.servings,
      baseIngredients: recipe.baseIngredients || recipe.ingredients
    };

    if (editingRecipe?.id && recipes.find(r => r.id === editingRecipe.id)) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipeWithBase : r));
    } else {
      setRecipes([...recipes, { ...recipeWithBase, id: recipe.id || Date.now(), lastUsed: null }]);
    }

    setShowAddRecipe(false);
    setEditingRecipe(null);
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
    setWeeklyPlan(weeklyPlan.filter(p => p.recipeId !== id));
  };

  const addToWeeklyPlan = (recipe) => {
    setWeeklyPlan([...weeklyPlan, {
      id: Date.now(),
      recipeId: recipe.id,
      day: weeklyPlan.length,
      servings: recipe.baseServings || recipe.servings
    }]);
  };

  const removeFromPlan = (id) => {
    setWeeklyPlan(weeklyPlan.filter(p => p.id !== id));
  };

  const updatePlanServings = (id, servings) => {
    setWeeklyPlan(weeklyPlan.map(p => p.id === id ? { ...p, servings: parseInt(servings) } : p));
  };

  const movePlanItem = (id, direction) => {
    const index = weeklyPlan.findIndex(p => p.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === weeklyPlan.length - 1)) return;

    const newPlan = [...weeklyPlan];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPlan[index], newPlan[newIndex]] = [newPlan[newIndex], newPlan[index]];
    setWeeklyPlan(newPlan);
  };

  const generateGroceryList = () => {
    const ingredientMap = {};
    const updatedRecipes = [...recipes];

    weeklyPlan.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (!recipe) return;

      const recipeIndex = updatedRecipes.findIndex(r => r.id === recipe.id);
      if (recipeIndex !== -1) {
        updatedRecipes[recipeIndex] = { ...recipe, lastUsed: new Date().toISOString() };
      }

      const baseServings = recipe.baseServings || recipe.servings;
      const multiplier = plan.servings / baseServings;
      const ingredientsToUse = recipe.baseIngredients || recipe.ingredients;

      ingredientsToUse.forEach(ing => {
        const key = ing.name.toLowerCase();
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            name: ing.name,
            unit: ing.unit,
            totalAmount: 0,
            department: categorizeIngredient(ing.name),
            inPantry: false
          };
        }
        const amount = fractionToDecimal(ing.amount);
        ingredientMap[key].totalAmount += amount * multiplier;
      });
    });

    setRecipes(updatedRecipes);

    const list = Object.values(ingredientMap)
      .map(item => ({
        ...item,
        displayAmount: consolidateAmount(item.totalAmount, item.unit, item.name),
        inPantry: pantryItems.some(p => p.toLowerCase() === item.name.toLowerCase())
      }))
      .sort((a, b) => {
        const order = ['Produce', 'Meat/Fish', 'Dairy', 'Pantry', 'Spices', 'Other'];
        return order.indexOf(a.department) - order.indexOf(b.department);
      });

    setGroceryList(list);
  };

  const consolidateAmount = (amount, unit, name) => {
    const rounded = Math.ceil(amount * 4) / 4;

    if (unit.toLowerCase().includes('clove') && name.toLowerCase().includes('garlic')) {
      const heads = Math.ceil(rounded / 10);
      return heads === 1 ? '1 head' : `${heads} heads`;
    }

    if (unit.toLowerCase().includes('cup') && rounded > 1) {
      return `${rounded} cups`;
    }

    return `${rounded} ${unit}`;
  };

  const categorizeIngredient = (name) => {
    const lower = name.toLowerCase();
    if (/(tomato|onion|garlic|pepper|carrot|celery|spinach|potato|basil)/i.test(lower)) return 'Produce';
    if (/(chicken|beef|pork|fish|sausage)/i.test(lower)) return 'Meat/Fish';
    if (/(milk|cheese|butter|cream|yogurt|egg|ricotta|parmesan)/i.test(lower)) return 'Dairy';
    if (/(salt|pepper|oregano|nutmeg|spice)/i.test(lower)) return 'Spices';
    if (/(flour|sugar|oil|sauce|broth|marinara|noodle|paste)/i.test(lower)) return 'Pantry';
    return 'Other';
  };

  const downloadGroceryList = () => {
    const items = groceryList.filter(item => !item.inPantry);
    const csv = [['Item', 'Amount', 'Department'], ...items.map(item => [`"${item.name}"`, `"${item.displayAmount}"`, `"${item.department}"`])].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePantryItem = (itemName) => {
    const newItems = pantryItems.includes(itemName) ? pantryItems.filter(p => p !== itemName) : [...pantryItems, itemName];
    setPantryItems(newItems);
    setGroceryList(prevList => prevList.map(item => item.name === itemName ? { ...item, inPantry: !item.inPantry } : item));
  };

  const addCustomGroceryItem = () => {
    if (!newGroceryItem.name.trim()) return;
    
    const customItem = {
      name: newGroceryItem.name,
      displayAmount: newGroceryItem.amount || '1',
      department: newGroceryItem.department,
      inPantry: false,
      unit: '',
      totalAmount: 0
    };
    
    setGroceryList([...groceryList, customItem]);
    setNewGroceryItem({ name: '', amount: '', department: 'Other' });
  };

  const removeGroceryItem = (itemName) => {
    setGroceryList(groceryList.filter(item => item.name !== itemName));
  };

  const filterRecipes = (recipeList) => {
    if (!searchTerm.trim()) return recipeList;
    const search = searchTerm.toLowerCase();
    return recipeList.filter(recipe => {
      if (searchBy === 'name') return recipe.name.toLowerCase().includes(search);
      if (searchBy === 'cuisine') return recipe.cuisine.toLowerCase().includes(search);
      if (searchBy === 'ingredients') return recipe.ingredients.some(ing => ing.name.toLowerCase().includes(search));
      return true;
    });
  };

  const cuisineTypes = ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian', 'French', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Smarty Meal Planner</h1>
            </div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Recipe (PDF/DOCX)
              <input type="file" accept=".pdf,.docx" onChange={handlePDFUpload} className="hidden" />
            </label>
          </div>

          <div className="flex gap-2 mb-6">
            {['recipes', 'planner', 'grocery'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {tab === 'recipes' ? 'Recipe Library' : tab === 'planner' ? 'Weekly Planner' : 'Grocery List'}
              </button>
            ))}
          </div>

          {activeTab === 'recipes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recipe Library</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                    <label className="text-sm font-medium">Search by:</label>
                    <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} className="border-0 bg-transparent text-sm focus:outline-none">
                      <option value="name">Recipe Name</option>
                      <option value="cuisine">Cuisine Type</option>
                      <option value="ingredients">Ingredient</option>
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 text-gray-400">✕</button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingRecipe({ id: null, name: '', cuisine: 'Other', ingredients: [], servings: 4 });
                      setShowAddRecipe(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Recipe
                  </button>
                </div>
              </div>

              {cuisineTypes.map(cuisine => {
                const cuisineRecipes = filterRecipes(recipes.filter(r => r.cuisine === cuisine));
                if (cuisineRecipes.length === 0) return null;

                return (
                  <div key={cuisine} className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">{cuisine}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cuisineRecipes.map(recipe => (
                        <div key={recipe.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold text-lg">{recipe.name}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingRecipe(recipe); setShowAddRecipe(true); }} className="text-blue-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteRecipe(recipe.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Serves: {recipe.servings}</p>
                          <p className="text-xs text-gray-500 mb-3">Last used: {recipe.lastUsed ? new Date(recipe.lastUsed).toLocaleDateString() : 'Never'}</p>
                          <button onClick={() => addToWeeklyPlan(recipe)} className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">
                            Add to Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'planner' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Weekly Meal Plan</h2>
              {weeklyPlan.length === 0 ? (
                <p className="text-gray-600">No meals planned yet!</p>
              ) : (
                <div className="space-y-3">
                  {weeklyPlan.map((plan, index) => {
                    const recipe = recipes.find(r => r.id === plan.recipeId);
                    if (!recipe) return null;

                    return (
                      <div key={plan.id} className="border rounded-lg p-4 bg-gray-50 flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => movePlanItem(plan.id, 'up')} disabled={index === 0} className="text-gray-600">▲</button>
                          <button onClick={() => movePlanItem(plan.id, 'down')} disabled={index === weeklyPlan.length - 1} className="text-gray-600">▼</button>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Day {index + 1}: {recipe.name}</h4>
                          <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <input type="number" min="1" value={plan.servings} onChange={(e) => updatePlanServings(plan.id, e.target.value)} className="w-16 px-2 py-1 border rounded" />
                        </div>
                        <button onClick={() => removeFromPlan(plan.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {weeklyPlan.length > 0 && (
                <button onClick={generateGroceryList} className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Generate Grocery List
                </button>
              )}
            </div>
          )}

          {activeTab === 'grocery' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Grocery List</h2>
                {groceryList.length > 0 && (
                  <button onClick={downloadGroceryList} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download CSV
                  </button>
                )}
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold mb-3">Add Custom Item</h3>
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newGroceryItem.name}
                    onChange={(e) => setNewGroceryItem({ ...newGroceryItem, name: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomGroceryItem()}
                    className="col-span-5 px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Amount (optional)"
                    value={newGroceryItem.amount}
                    onChange={(e) => setNewGroceryItem({ ...newGroceryItem, amount: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomGroceryItem()}
                    className="col-span-3 px-3 py-2 border rounded"
                  />
                  <select
                    value={newGroceryItem.department}
                    onChange={(e) => setNewGroceryItem({ ...newGroceryItem, department: e.target.value })}
                    className="col-span-3 px-3 py-2 border rounded"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Meat/Fish">Meat/Fish</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    onClick={addCustomGroceryItem}
                    className="col-span-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

              {groceryList.length === 0 ? (
                <p className="text-gray-600">Generate a grocery list from your weekly plan!</p>
              ) : (
                <div>
                  {['Produce', 'Meat/Fish', 'Dairy', 'Pantry', 'Spices', 'Other'].map(dept => {
                    const items = groceryList.filter(item => item.department === dept);
                    if (items.length === 0) return null;

                    return (
                      <div key={dept} className="mb-6">
                        <h3 className="text-xl font-semibold mb-3 border-b-2 pb-2">{dept}</h3>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                <input type="checkbox" checked={item.inPantry} onChange={() => togglePantryItem(item.name)} className="w-5 h-5" />
                                <span className={item.inPantry ? 'line-through text-gray-400' : ''}>{item.name}</span>
                              </label>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-600">{item.displayAmount}</span>
                                <button onClick={() => removeGroceryItem(item.name)} className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddRecipe && (
        <RecipeForm
          recipe={editingRecipe}
          onSave={addOrUpdateRecipe}
          onCancel={() => { setShowAddRecipe(false); setEditingRecipe(null); }}
          existingRecipes={recipes}
        />
      )}
    </div>
  );
};

export default MealPlannerApp;
