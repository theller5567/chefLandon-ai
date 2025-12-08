import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function Recipe({ recipe }) {
  if (!recipe) return null

  const { title, ingredients = [], steps = [], raw } = recipe
  const hasStructured = ingredients.length > 0 || steps.length > 0
  const rawContent = raw || recipe.raw || ''

  const stripFirstHeading = (text) => {
    const lines = text.split('\n')
    const trimmed = lines[0]?.startsWith('#') ? lines.slice(1) : lines
    return trimmed.join('\n')
  }

  const displayRaw = hasStructured ? stripFirstHeading(rawContent) : rawContent

  return (
    <section id="recipe-section">
      <h2>Your Recipe</h2>

      {title && <h3 className="recipe-title">{title}</h3>}

      {hasStructured ? (
        <div className="recipe-grid">
          {ingredients.length > 0 && (
            <div className="recipe-card">
              <h4>Ingredients</h4>
              <ul>
                {ingredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <div className="recipe-card">
              <h4>Instructions</h4>
              <ol>
                {steps.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : null}

      {/* Always show the raw markdown for completeness */}
     {!(title && ingredients && steps) && 
        <div className="recipe-raw">
            <ReactMarkdown remarkPlugins={[remarkGfm]} children={displayRaw} />
        </div> 
      }
    </section>
  )
}

export default Recipe