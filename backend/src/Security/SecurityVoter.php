<?php

namespace App\Security;

use App\Entity\Task;
use App\Entity\TodoList;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SecurityVoter extends Voter
{
    private const EDIT = 'EDIT';
    private const VIEW = 'VIEW';
    private const DELETE = 'DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::EDIT, self::VIEW, self::DELETE], true)) {
            return false;
        }

        return $subject instanceof TodoList || $subject instanceof Task;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        if ($user->hasRole('ROLE_ADMIN')) {
            return true;
        }

        if ($subject instanceof TodoList) {
            return $this->isOwner($user, $subject->getUser());
        }

        if ($subject instanceof Task) {
            return $this->isOwner($user, $subject->getTodoList()?->getUser());
        }

        return false;
    }

    private function isOwner(?User $currentUser, ?User $owner): bool
    {
        return $currentUser !== null && $owner !== null && $currentUser->getId() === $owner->getId();
    }
}
