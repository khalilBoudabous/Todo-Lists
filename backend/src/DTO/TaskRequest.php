<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class TaskRequest
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 150)]
    public string $title;

    #[Assert\Length(max: 5000)]
    public ?string $description = null;

    #[Assert\NotBlank]
    public string $status;

    #[Assert\NotBlank]
    public string $priority;

    public ?string $dueDate = null;
}
