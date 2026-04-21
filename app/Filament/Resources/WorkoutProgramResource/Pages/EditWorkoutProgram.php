<?php

namespace App\Filament\Resources\WorkoutProgramResource\Pages;

use App\Filament\Resources\WorkoutProgramResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditWorkoutProgram extends EditRecord
{
    protected static string $resource = WorkoutProgramResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
