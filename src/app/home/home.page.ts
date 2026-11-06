
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../models/recipe.model';
import { RecipeService } from '../core/services/recipe.service';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonModal,
  IonButton,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonAlert
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBadge,
    IonModal,
    IonButton,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonAlert
  ],
})
export class HomePage implements OnInit {

  constructor(
    private recipeService: RecipeService,
    private cdr: ChangeDetectorRef
  ) {}

  // Control del modal
  isRecipeModalOpen = false;

  // Control de edición
  editingRecipeId: number | null = null;

  // Buscador
  searchText = '';

  // Control de eliminación
  isDeleteAlertOpen = false;
  recipeToDeleteId: number | null = null;

  // Datos del formulario
newRecipe: Omit<Recipe, 'id'> = {
  name: '',
  category: '',
  ingredients: '',
  preparation: ''
};

// Control de validaciones
submitted = false;

  // Lista de recetas
  recipes: Recipe[] = [];

  // Botones de confirmación
  deleteAlertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        this.recipeToDeleteId = null;
        this.isDeleteAlertOpen = false;
        this.cdr.detectChanges();
      }
    },
    {
      text: 'Eliminar',
      role: 'destructive',
      handler: () => {
        void this.confirmDeleteRecipe();
      }
    }
  ];

  // Cargar recetas al iniciar la pantalla
  async ngOnInit() {
    await this.loadRecipes();
  }

  // Obtener recetas del almacenamiento local
  async loadRecipes() {
    try {
      this.recipes = await this.recipeService.getRecipes();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar las recetas:', error);
    }
  }

  // Abrir modal para crear
  openRecipeModal() {
    this.resetRecipeForm();
    this.isRecipeModalOpen = true;
  }

  // Cerrar modal
  closeRecipeModal() {
    this.isRecipeModalOpen = false;
  }

  // Preparar receta para editar
  editRecipe(recipe: Recipe) {
    this.editingRecipeId = recipe.id;

    this.newRecipe = {
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients,
      preparation: recipe.preparation
    };

    this.isRecipeModalOpen = true;
  }

  // Guardar receta nueva o modificación
  async saveRecipe() {
  this.submitted = true;

  if (
    !this.newRecipe.name.trim() ||
    !this.newRecipe.category ||
    !this.newRecipe.ingredients.trim() ||
    !this.newRecipe.preparation.trim()
  ) {
    return;
  }

  try {
    if (this.editingRecipeId !== null) {
      const updatedRecipe: Recipe = {
        id: this.editingRecipeId,
        ...this.newRecipe
      };

      await this.recipeService.updateRecipe(updatedRecipe);

      this.recipes = this.recipes.map(recipe =>
        recipe.id === this.editingRecipeId
          ? updatedRecipe
          : recipe
      );

    } else {
      const recipe: Recipe = {
        id: Date.now(),
        ...this.newRecipe
      };

      await this.recipeService.addRecipe(recipe);

      this.recipes = [...this.recipes, recipe];
    }

    this.resetRecipeForm();
    this.closeRecipeModal();
    this.cdr.detectChanges();

  } catch (error) {
    console.error('Error al guardar la receta:', error);
  }
}

  // Limpiar formulario
  resetRecipeForm() {
    this.newRecipe = {
      name: '',
      category: '',
      ingredients: '',
      preparation: ''
    };

    this.editingRecipeId = null;
    this.submitted = false;
  }

  // Mostrar confirmación
  confirmDelete(recipeId: number) {
    this.recipeToDeleteId = recipeId;
    this.isDeleteAlertOpen = true;
  }

  // Eliminar receta
  async deleteRecipe(recipeId: number) {
    await this.recipeService.deleteRecipe(recipeId);

    this.recipes = this.recipes.filter(
      recipe => recipe.id !== recipeId
    );
  }

  // Confirmar eliminación
  async confirmDeleteRecipe() {
    if (this.recipeToDeleteId === null) {
      return;
    }

    try {
      await this.deleteRecipe(this.recipeToDeleteId);

      this.recipeToDeleteId = null;
      this.isDeleteAlertOpen = false;

      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error al eliminar la receta:', error);
    }
  }

  // Filtrar recetas
  get filteredRecipes(): Recipe[] {
    return this.recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
