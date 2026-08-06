<?php

namespace App\Controller\Api;

use App\DTO\UserRegistrationRequest;
use App\Service\UserService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/register', name: 'api_register_')]
class RegisterController extends AbstractController
{
    public function __construct(
        private UserService $userService,
        private JWTTokenManagerInterface $jwtManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'register', methods: ['POST'])]
    #[OA\Post(
        path: '/api/register',
        summary: 'Register a new user',
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'email', type: 'string', format: 'email'),
                        new OA\Property(property: 'firstName', type: 'string', minLength: 2, maxLength: 100),
                        new OA\Property(property: 'lastName', type: 'string', minLength: 2, maxLength: 100),
                        new OA\Property(property: 'password', type: 'string', minLength: 6, maxLength: 255, format: 'password'),
                        new OA\Property(property: 'passwordConfirm', type: 'string', minLength: 6, maxLength: 255, format: 'password'),
                        new OA\Property(property: 'role', type: 'string', enum: ['ROLE_USER', 'ROLE_ADMIN'], default: 'ROLE_USER'),
                    ]
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User registered successfully',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean'),
                        new OA\Property(property: 'data', type: 'object'),
                        new OA\Property(property: 'token', type: 'string'),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Validation error'),
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        $content = $request->getContent();
        $dto = $this->serializer->deserialize($content, UserRegistrationRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->userService->register($dto);
        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
            'token' => $token,
            'message' => 'User registered successfully.',
        ], JsonResponse::HTTP_CREATED);
    }
}
