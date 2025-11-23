import React from 'react'


const Itemm = ({saved,index}) => {
  // Handle servings - can be number or string
  const servingsDisplay = typeof saved.servings === 'number' 
    ? saved.servings 
    : (typeof saved.servings === 'string' ? saved.servings.slice(0,1) : 'N/A');

  return (
    
    <div className='single-item'>
        <div>
          <p className='recipe-num'>Recipe {index+1}</p>
          <p className='recipe-title'>{saved.title}</p>
          <p>Servings: {servingsDisplay}</p>
        </div>
        {saved.image && <img src={saved.image} alt={saved.title} />}
    </div>
    
  )
}

export default Itemm