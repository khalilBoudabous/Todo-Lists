<?php

namespace App\Controller\Api;

use App\DTO\ChangePasswordRequest;
use App\DTO\UserProfileUpdateRequest;
use App\Entity\User;
use App\Service\UserService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserService $userService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $jwtManager,
    ) {
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    #[OA\Get(
        path: '/api/profile',
        summary: 'Get current user profile',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = $this->userService->getProfile($user);

        return $this->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    #[Route('/profile', name: 'profile_update', methods: ['PUT'])]
    #[OA\Put(
        path: '/api/profile',
        summary: 'Update current user profile',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $dto = $this->serializer->deserialize($request->getContent(), UserProfileUpdateRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->userService->updateProfile($user, $dto);

        return $this->json([
            'success' => true,
            'data' => $this->userService->getProfile($user),
            'message' => 'Profile updated successfully.',
        ]);
    }

    #[Route('/change-password', name: 'change_password', methods: ['PUT'])]
    #[OA\Put(
        path: '/api/change-password',
        summary: 'Change current user password',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $dto = $this->serializer->deserialize($request->getContent(), ChangePasswordRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $this->userService->changePassword($user, $dto);
        } catch (\InvalidArgumentException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    #[Route('/login_check', name: 'login_check', methods: ['POST'])]
    #[OA\Post(
        path: '/api/login_check',
        summary: 'Login user and return JWT token',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'token', type: 'string'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Invalid credentials'),
        ]
    )]
    public function loginCheck(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'token' => $token,
            'data' => $this->userService->getProfile($user),
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    #[OA\Post(
        path: '/api/logout',
        summary: 'Logout user',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout successful'
            ),
        ]
    )]
    public function logout(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
