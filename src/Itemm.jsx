import React from 'react'
import { MdPeople, MdAccessTime } from 'react-icons/md'

const Itemm = ({saved,index}) => {
  // Handle servings - can be number or string
  const servingsDisplay = typeof saved.servings === 'number' 
    ? saved.servings 
    : (typeof saved.servings === 'string' ? saved.servings.slice(0,1) : 'N/A');

  // Default image if not provided
  const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400';
  const imageUrl = saved.image || defaultImage;

  // Get ready time if available
  const readyTime = saved.readyInMinutes || saved.ready_in_minutes || null;

  return (
    <div className='single-item'>
        <img src={imageUrl} alt={saved.title} onError={(e) => {e.target.src = defaultImage}} />
        <div className='item-content'>
          <p className='recipe-num'>Recipe {index+1}</p>
          <p className='recipe-title'>{saved.title}</p>
          <div className='recipe-meta'>
            <p><MdPeople /> {servingsDisplay} servings</p>
            {readyTime && <p><MdAccessTime /> {readyTime} min</p>}
          </div>
        </div>
    </div>
  )
}

export default Itemm