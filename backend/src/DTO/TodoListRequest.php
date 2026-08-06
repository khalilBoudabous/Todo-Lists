<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class TodoListRequest
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 150)]
    public string $title;

    #[Assert\Length(max: 5000)]
    public ?string $description = null;
}
