import { useMemo, useState } from 'react'
import './assets/css/App.scss'
import { fetchRecipe } from './api'
import Recipe from './components/Recipe'
import IngredientList from './components/IngredientList'
import { FaPlus } from 'react-icons/fa6'


function App() {
  const [ingredients, setIngredients] = useState([])
  const [newIngredient, setNewIngredient] = useState('')
  const [recipe, setRecipe] = useState(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [ingredientsDirty, setIngredientsDirty] = useState(false)
  // Served from /public/images; no /public prefix needed in production
  const logo = '/images/chefLandon-logo3.svg'

  const ingredientButtonText = newIngredient.length > 1 ? 'Add Ingredients' : 'Add Ingredient'
  const canGetRecipe = ingredients.length > 2 && ingredientsDirty && !recipeLoading
  const getRecipeLabel = recipeLoading ? 'Preparing…' : 'Get Recipe'
  const getRecipeButtonClass = useMemo(() => {
    if (recipeLoading) return 'get-recipe-button loading'
    return canGetRecipe ? 'get-recipe-button' : 'get-recipe-button-disabled'
  }, [canGetRecipe, recipeLoading])

  function parseRecipeText(text) {
    if (!text) return { title: '', ingredients: [], steps: [], raw: '' }

    const lines = text.split('\n')
    const normalized = lines.map((l) => l.trim())

    // Title: first heading line or first non-empty line.
    const headingLine = normalized.find((l) => l.startsWith('#'))
    const firstContent = normalized.find((l) => l.length > 0) || ''
    const title = (headingLine || firstContent).replace(/^#+\s*/, '').trim()

    const findSection = (keywords) =>
      normalized.findIndex((l) => {
        const lower = l.toLowerCase()
        return keywords.some((k) => lower.startsWith(k) || lower === k || lower.includes(`${k}:`))
      })

    const ingredientsIdx = findSection([
      '#### ingredients',
      '### ingredients',
      '## ingredients',
      '# ingredients',
      'ingredients',
      'shopping list',
    ])

    const instructionsIdx = findSection([
      '#### instructions',
      '#### directions',
      '### instructions',
      '### directions',
      '## instructions',
      '## directions',
      '# instructions',
      '# directions',
      'instructions',
      'directions',
      'steps',
      'method',
    ])

    const sliceSection = (startIdx) => {
      if (startIdx === -1) return []
      const rest = normalized.slice(startIdx + 1)
      const nextHeading = rest.findIndex((l) => l.startsWith('#') || /^[-=]{3,}$/.test(l))
      const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading)
      return body
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter((l) => l.length > 0)
    }

    let parsedIngredients = sliceSection(ingredientsIdx)
    let parsedSteps = sliceSection(instructionsIdx)

    // Fallback: if no sections found, try to capture first bullet block as ingredients, next as steps.
    if (parsedIngredients.length === 0) {
      const firstBulletIdx = normalized.findIndex((l) => l.startsWith('- ') || l.startsWith('* '))
      if (firstBulletIdx !== -1) {
        const bullets = normalized.slice(firstBulletIdx).map((l) => l.replace(/^[-*]\s*/, '')).filter(Boolean)
        parsedIngredients = bullets
      }
    }

    if (parsedSteps.length === 0 && parsedIngredients.length > 0) {
      // Try to find another bullet block after a blank line
      const blankIdx = normalized.findIndex((l, idx) => l === '' && idx > 0)
      if (blankIdx !== -1) {
        const maybeSteps = normalized
          .slice(blankIdx + 1)
          .map((l) => l.replace(/^[-*]\s*/, '').trim())
          .filter(Boolean)
        parsedSteps = maybeSteps
      }
    }

    return { title, ingredients: parsedIngredients, steps: parsedSteps, raw: text }
  }
  function handleSubmit(event) {
    event.preventDefault()
    const newIngredient = event.target.ingredient.value.trim()
    if(newIngredient === '') return
    if(newIngredient.split(',').length > 0) {
      console.log(newIngredient.split(','))
      setIngredients([...ingredients, ...newIngredient.split(',')])
      setNewIngredient('')
      setIngredientsDirty(true)
    } else {
      console.log(newIngredient)
    }
  }

  async function getRecipe() {
    setRecipeLoading(true)
    try {
      const recipeText = await fetchRecipe(ingredients)
      const parsed = parseRecipeText(recipeText)
      setRecipe(parsed)
      setIngredientsDirty(false)
    } catch (error) {

      console.error(error)
    } finally {
      setRecipeLoading(false)
    }
  }

  function removeIngredient(ingredient) {
    setIngredients(ingredients.filter(i => i !== ingredient))
    setIngredientsDirty(true)
  }

  return (
    <main>
      <img src={logo} alt="Chef Landon logo" />
     <form id="ingredient-form" onSubmit={handleSubmit}>
      <input 
      type="text" 
      placeholder="Add an ingredient" 
      value={newIngredient} 
      name="ingredient" 
      onChange={(e) => setNewIngredient(e.target.value)} />
      <button type="submit"><FaPlus />{ingredientButtonText}</button>
     </form>
     <IngredientList ingredients={ingredients} onRemove={removeIngredient} />
    
      <div className="get-recipe-button-container">
        <div>
          <h2>Ready for your recipe?</h2>
          
          {!(ingredients.length > 2) ? 
          <p>Please add at least 3 ingredients to get a recipe.</p> : 
          <p>Generate a recipe from your list of ingredients.</p>}
        </div>
        <button
          id="get-recipe-button"
          onClick={getRecipe}
          className={getRecipeButtonClass}
          disabled={!canGetRecipe}
          aria-busy={recipeLoading}
        >
          {getRecipeLabel}
        </button>
        {recipeLoading && <p className="get-recipe-button-text">Please wait while we prepare your recipe...</p>}
      </div>
    {recipe && (
      <Recipe recipe={recipe} />
    )}
    </main>
  );
}

export default App;