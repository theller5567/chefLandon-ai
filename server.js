import Anthropic from '@anthropic-ai/sdk'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.post('/recipe', async (req, res) => {
  try {
    const ingredients = req.body?.ingredients

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients must be a non-empty array of strings' })
    }

    const recipeText = await getRecipeFromChefClaude(ingredients)
    res.json({ recipe: recipeText })
  } catch (error) {
    console.error('Error generating recipe:', error)
    res.status(500).json({ error: 'Failed to generate recipe' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})


const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY. Add it to your .env file.')
}

const anthropic = new Anthropic({ apiKey })

async function getRecipeFromChefClaude(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(', ')

  const msg = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` }],
  })

  return msg.content[0].text
}

