<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class ChangePasswordRequest
{
    #[Assert\NotBlank]
    public string $currentPassword;

    #[Assert\NotBlank]
    #[Assert\Length(min: 6, max: 255)]
    public string $newPassword;

    #[Assert\NotBlank]
    #[Assert\Length(min: 6, max: 255)]
    public string $confirmPassword;

    #[Assert\Callback]
    public function validate(ExecutionContextInterface $context): void
    {
        if ($this->newPassword !== $this->confirmPassword) {
            $context->buildViolation('New passwords do not match')
                ->atPath('confirmPassword')
                ->addViolation();
        }
    }
}
