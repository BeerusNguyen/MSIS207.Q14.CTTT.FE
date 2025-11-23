import React, { useEffect } from 'react';
import api1 from './api/fetchSaved';
import { useNavigate } from 'react-router-dom';
import { MdFastfood } from "react-icons/md";
import getNutrition from './api/fetchNutrition';

import NutritionComponent from './NutritionComponent';

const RecipeTemplate = ({ ourDish, ingredientsArray, cookingInstructions, buttonVal, savedData, setSavedData, nutriData, setNutriData,searchVal }) => {
    const navig = useNavigate();

    // Function to expand common abbreviations in ingredients
    const expandAbbreviations = (text) => {
        if (!text) return text;
        
        const abbreviations = {
            ' tb ': ' tablespoon ',
            ' tbs ': ' tablespoon ',
            ' tbsp ': ' tablespoon ',
            ' c ': ' cup ',
            ' tsp ': ' teaspoon ',
            ' oz ': ' ounce ',
            ' lb ': ' pound ',
            ' lbs ': ' pounds ',
            ' qt ': ' quart ',
            ' pt ': ' pint ',
            ' gal ': ' gallon ',
            ' ml ': ' milliliter ',
            ' g ': ' gram ',
            ' kg ': ' kilogram ',
            ' mg ': ' milligram ',
        };
        
        let expandedText = text;
        Object.keys(abbreviations).forEach(abbr => {
            const regex = new RegExp(abbr, 'gi');
            expandedText = expandedText.replace(regex, abbreviations[abbr]);
        });
        
        return expandedText;
    };

    // Function to clean up cooking instructions
    const cleanInstruction = (instruction) => {
        if (!instruction) return '';
        // Remove standalone parentheses and clean up whitespace
        return instruction
            .replace(/^\s*\(\s*$/g, '') // Remove lines with just opening parenthesis
            .replace(/^\s*\)\s*$/g, '') // Remove lines with just closing parenthesis
            .trim();
    };

    const SaveTheRecipe = async () => {
        const newRecipe = {
            title: ourDish.title,
            ingredients: ourDish.ingredients,
            servings: ourDish.servings,
            instructions: ourDish.instructions,
            nutrition:nutriData
        };
        await api1.post('/recipes', newRecipe);
        const updated_savedData = [...savedData, newRecipe];
        setSavedData(updated_savedData);

        console.log("save hehe");
        navig("/saved");
        alert("Item successfully added :D")
    };

    const RemoveTheRecipe = async () => {
        const curr_id = ourDish.id;
        await api1.delete(`/recipes/${ourDish.id}`);
        const updated_savedData = savedData.filter((saved) => (saved.id !== curr_id));
        setSavedData(updated_savedData);
        console.log("removed hehe");
        navig("/saved");
        alert("Item successfully removed :D")
    };

    useEffect(() => {
        const fetNut = async () => {
            try {
                const recipe = `100g ${searchVal}`;
                const nut_data = await getNutrition(recipe);
                setNutriData(nut_data);
                console.log("2nd" + nut_data);
            } catch (error) {
                console.log(error.message);
            }
        };

        (async () => await fetNut())();
    }, [searchVal,setNutriData]);

    const filterNutrients = (data) => {
        const desiredNutrients = ['ENERC_KCAL', 'FAT', 'CHOCDF', 'FIBTG', 'SUGAR', 'PROCNT', 'CHOLE'];
        const filteredData = {};

        if (data) {
            desiredNutrients.forEach(nutrient => {
                if (data[nutrient]) {
                    filteredData[nutrient] = data[nutrient];
                }
            });
        }

        return filteredData;
    };

    const filteredNutrients = nutriData && nutriData.totalNutrients ? filterNutrients(nutriData.totalNutrients) : null;



    return (
        <>
            <div className='recipe-det-head'>
                <h1 className='dish-title'>{ourDish.title}</h1>
                {buttonVal === "Save this Recipe" ?
                    <button id='add_rec' onClick={SaveTheRecipe}>{buttonVal}</button>
                    :
                    <button id='remove_rec' onClick={RemoveTheRecipe}>{buttonVal}</button>
                }
            </div>

            <div className='ing-nut'>
                <div className='ingr'>
                    <h2>Ingredients</h2>
                    <br />
                    <ul>
                        {ingredientsArray.map((ing, index) => (
                            <li key={index}><MdFastfood /> {expandAbbreviations(ing)}</li>
                        ))}
                    </ul>
                </div>

                <NutritionComponent
                nutriData={nutriData}
                filteredNutrients={filteredNutrients}
                 />
            </div>
            <div className='cook-container'>
                <div className='cook-deets'>
                    <h1>Cooking Instructions</h1>
                    <br />
                    <ul>
                        {cookingInstructions.map((inst, index) => {
                            const cleanedInst = cleanInstruction(inst);
                            return cleanedInst ? <li key={index}><MdFastfood /> {cleanedInst}</li> : null;
                        })}
                    </ul>
                    <hr />
                    <hr />
                </div>
            </div>

            <br />

        </>
    );
};

export default RecipeTemplate;
