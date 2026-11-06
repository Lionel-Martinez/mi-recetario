import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Recipe } from '../../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly STORAGE_KEY = 'mi-recetario-recipes';

  // Recetas iniciales para una instalación nueva
  private readonly initialRecipes: Recipe[] = [
    {
      id: 1,
      name: 'Tarta de jamón y queso',
      category: 'Almuerzo',
      ingredients: 'Harina, huevos, jamón y queso',
      preparation: 'Preparar la masa y agregar el relleno.'
    },
    {
      id: 2,
      name: 'Panqueques',
      category: 'Postres',
      ingredients: 'Harina, leche y huevos',
      preparation: 'Mezclar los ingredientes y cocinar en una sartén.'
    },
    {
      id: 3,
      name: 'Milanesas con papas',
      category: 'Cena',
      ingredients: 'Carne, huevo, pan rallado y papas',
      preparation: 'Empanar las milanesas y cocinarlas junto con las papas.'
    }
  ];

  // Obtener todas las recetas guardadas
  async getRecipes(): Promise<Recipe[]> {
    const { value } = await Preferences.get({
      key: this.STORAGE_KEY
    });

    // Si es la primera ejecución, guardar las recetas iniciales
    if (value === null) {
      await this.saveRecipes(this.initialRecipes);
      return [...this.initialRecipes];
    }

    try {
      return JSON.parse(value) as Recipe[];
    } catch (error) {
      console.error('Error al leer las recetas:', error);
      return [];
    }
  }

  // Guardar todas las recetas
  async saveRecipes(recipes: Recipe[]): Promise<void> {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(recipes)
    });
  }

  // Agregar una receta
  async addRecipe(recipe: Recipe): Promise<void> {
    const recipes = await this.getRecipes();

    recipes.push(recipe);

    await this.saveRecipes(recipes);
  }

  // Actualizar una receta
  async updateRecipe(updatedRecipe: Recipe): Promise<void> {
    const recipes = await this.getRecipes();

    const updatedRecipes = recipes.map(recipe =>
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    );

    await this.saveRecipes(updatedRecipes);
  }

  // Eliminar una receta
  async deleteRecipe(recipeId: number): Promise<void> {
    const recipes = await this.getRecipes();

    const updatedRecipes = recipes.filter(
      recipe => recipe.id !== recipeId
    );

    await this.saveRecipes(updatedRecipes);
  }
}
