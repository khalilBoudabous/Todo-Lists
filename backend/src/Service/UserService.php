<?php

namespace App\Service;

use App\DTO\ChangePasswordRequest;
use App\DTO\UserProfileUpdateRequest;
use App\DTO\UserRegistrationRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;

class UserService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepository $userRepository,
        private SerializerInterface $serializer,
    ) {
    }

    public function register(UserRegistrationRequest $request): User
    {
        $user = new User();
        $user->setEmail($request->email);
        $user->setFirstName($request->firstName);
        $user->setLastName($request->lastName);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $request->password)
        );
        $user->setRoles([$request->role ?? 'ROLE_USER']);

        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    public function getProfile(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'roles' => $user->getRoles(),
            'isEnabled' => $user->isEnabled(),
            'createdAt' => $user->getCreatedAt()?->format(\DateTime::ATOM),
        ];
    }

    public function updateProfile(User $user, UserProfileUpdateRequest $request): User
    {
        $user->setFirstName($request->firstName);
        $user->setLastName($request->lastName);

        $this->em->flush();

        return $user;
    }

    public function changePassword(User $user, ChangePasswordRequest $request): User
    {
        if (!$this->passwordHasher->isPasswordValid($user, $request->currentPassword)) {
            throw new \InvalidArgumentException('Current password is invalid.');
        }

        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $request->newPassword)
        );

        $this->em->flush();

        return $user;
    }

    public function searchUsers(?string $query, ?string $role, ?bool $isEnabled, int $page, int $limit): array
    {
        return $this->userRepository->searchUsers($query ?? '', $role, $isEnabled, $page, $limit);
    }
}
