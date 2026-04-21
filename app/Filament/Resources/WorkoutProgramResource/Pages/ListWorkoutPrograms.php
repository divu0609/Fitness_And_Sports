<?php

namespace App\Filament\Resources\WorkoutProgramResource\Pages;

use App\Filament\Resources\WorkoutProgramResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListWorkoutPrograms extends ListRecords
{
    protected static string $resource = WorkoutProgramResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
