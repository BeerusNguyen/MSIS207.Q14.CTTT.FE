import React from 'react'

const NutritionComponent = ({nutriData,filteredNutrients,who}) => {
    
  return (
    <div className={who?"full":"nutr"}>
                   
    <h2>Nutrition Facts</h2>
    <br />

    <h1>Calories : {nutriData ? nutriData.calories : 'Loading...'}</h1>
    <br />

    {
        filteredNutrients ? (
            <>
                <h2>Nutrients:</h2>
                <br />
                <ul>
                    {Object.keys(filteredNutrients).map(key => (
                        <li key={key} className='nut-nut-li'>
                            {filteredNutrients[key].label}: {filteredNutrients[key].quantity} {filteredNutrients[key].unit}
                        </li>
                    ))}
                </ul>
            </>
        ) : <p>Loading...</p>
    }

    <br />
    <h3>Diet Labels:</h3>

    <br />
    <ul>
        {nutriData && nutriData.dietLabels ? nutriData.dietLabels.map((dl, index) => (
            <li className='nut-nut-li' key={index}>{dl.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</li>
        )) : <p>Loading...</p>
        }
    </ul>
    <h3>Health Labels:</h3>
    
    <br />
    <ul>
        {nutriData && nutriData.healthLabels ? nutriData.healthLabels.slice(0, 5).map((hl, index) => (
            <li className='nut-nut-li' key={index}>{hl.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</li>
        )) : <p>Loading...</p>
        }
    </ul>

</div>
  )
}

export default NutritionComponent