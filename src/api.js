// Default to Netlify Function path; override with VITE_API_BASE_URL if needed.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions/recipe'

export async function fetchRecipe(ingredients) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to fetch recipe')
  }

  const data = await response.json()
  return data.recipe
}

