<?php

namespace App\DTO;

use OpenApi\Attributes as OA;
use Symfony\Component\Validator\Constraints as Assert;

#[OA\Schema(
    schema: 'UserRegistrationRequest',
    title: 'User Registration Request',
    description: 'Data transfer object for user registration'
)]
class UserRegistrationRequest
{
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    #[OA\Property(property: 'email', type: 'string', format: 'email', description: 'User email address')]
    public string $email;

    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    #[OA\Property(property: 'firstName', type: 'string', minLength: 2, maxLength: 100, description: 'User first name')]
    public string $firstName;

    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    #[OA\Property(property: 'lastName', type: 'string', minLength: 2, maxLength: 100, description: 'User last name')]
    public string $lastName;

    #[Assert\NotBlank]
    #[Assert\Length(min: 6, max: 255)]
    #[OA\Property(property: 'password', type: 'string', format: 'password', minLength: 6, description: 'User password')]
    public string $password;

    #[Assert\NotBlank]
    #[Assert\Length(min: 6, max: 255)]
    #[OA\Property(property: 'passwordConfirm', type: 'string', format: 'password', minLength: 6, description: 'Password confirmation')]
    public ?string $passwordConfirm = null;

    #[Assert\Choice(choices: ['ROLE_USER', 'ROLE_ADMIN'])]
    #[OA\Property(property: 'role', type: 'string', enum: ['ROLE_USER', 'ROLE_ADMIN'], description: 'User role', default: 'ROLE_USER')]
    public ?string $role = 'ROLE_USER';

    #[Assert\IsTrue(message: 'Passwords do not match')]
    public function isPasswordMatch(): bool
    {
        return $this->passwordConfirm !== null && $this->password === $this->passwordConfirm;
    }
}
