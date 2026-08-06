<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UserProfileUpdateRequest
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    public string $firstName;

    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    public string $lastName;
}
