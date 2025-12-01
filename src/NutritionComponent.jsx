import React from 'react'

const NutritionComponent = ({nutriData, filteredNutrients, who}) => {
    
    if (!nutriData) {
        return (
            <div className={who ? "full" : "nutr"}>
                <h2>Nutrition Facts</h2>
                <p>No nutrition data available</p>
            </div>
        );
    }

    const calories = nutriData.calories || 
                    nutriData.totalNutrients?.ENERC_KCAL?.quantity || 
                    0;

    const nutrients = filteredNutrients || nutriData.totalNutrients || {};
    const dietLabels = nutriData.dietLabels || [];
    const healthLabels = nutriData.healthLabels || [];

    return (
        <div className={who ? "full" : "nutr"}>
            <h2>Nutrition Facts</h2>
            <br />

            <h1>Calories: {Math.round(calories)}</h1>
            <br />

            {Object.keys(nutrients).length > 0 ? (
                <>
                    <h2>Nutrients:</h2>
                    <br />
                    <ul>
                        {Object.keys(nutrients).map(key => (
                            <li key={key} className='nut-nut-li'>
                                {nutrients[key].label || key}: {Math.round(nutrients[key].quantity)} {nutrients[key].unit}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>No detailed nutrient information</p>
            )}

            <br />
            <h3>Diet Labels:</h3>
            <br />
            <ul>
                {dietLabels.length > 0 ? (
                    dietLabels.map((dl, index) => (
                        <li className='nut-nut-li' key={index}>
                            {dl.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </li>
                    ))
                ) : (
                    <li className='nut-nut-li'>No specific diet labels</li>
                )}
            </ul>

            <h3>Health Labels:</h3>
            <br />
            <ul>
                {healthLabels.length > 0 ? (
                    healthLabels.slice(0, 5).map((hl, index) => (
                        <li className='nut-nut-li' key={index}>
                            {hl.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </li>
                    ))
                ) : (
                    <li className='nut-nut-li'>No specific health labels</li>
                )}
            </ul>
        </div>
    )
}

export default NutritionComponent