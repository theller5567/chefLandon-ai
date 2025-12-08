import React from 'react'
import { FaXmark } from 'react-icons/fa6'

function IngredientList({ ingredients, onRemove }) {

    const headerText = ingredients.length > 0 ? 'Ingredients on hand:' : 'You have no ingredients on hand. Add some to get started!'

  return (
    <div className="ingredients-list">
      <h2>{headerText}</h2>
      <ul className="ingredients-list-ul">
        {ingredients.map((ingredient) => {
          const key = ingredient.toLowerCase().trim()
          return (
            <li key={key}>
              <span className="ingredient-name">{ingredient}</span>
              <button
                type="button"
                className="remove-ingredient"
                aria-label={`Remove ${ingredient}`}
                onClick={() => onRemove(ingredient)}
              >
                <FaXmark />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  ) 
}

export default IngredientList