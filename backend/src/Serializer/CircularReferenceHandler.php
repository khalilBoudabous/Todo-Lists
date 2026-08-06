<?php

namespace App\Serializer;

use Doctrine\ORM\Proxy\Proxy;

class CircularReferenceHandler
{
    public function __invoke(mixed $object): ?array
    {
        if ($object instanceof Proxy) {
            return null;
        }

        if (is_object($object) && method_exists($object, 'getId')) {
            return ['id' => $object->getId()];
        }

        return null;
    }
}
