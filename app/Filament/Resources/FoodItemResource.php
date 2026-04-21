<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FoodItemResource\Pages;
use App\Filament\Resources\FoodItemResource\RelationManagers;
use App\Models\FoodItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class FoodItemResource extends Resource
{
    protected static ?string $model = FoodItem::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required(),
                Forms\Components\TextInput::make('calories')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('protein')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('carbs')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('fat')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('serving_size'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('calories')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('protein')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('carbs')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fat')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('serving_size')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFoodItems::route('/'),
            'create' => Pages\CreateFoodItem::route('/create'),
            'edit' => Pages\EditFoodItem::route('/{record}/edit'),
        ];
    }
}
