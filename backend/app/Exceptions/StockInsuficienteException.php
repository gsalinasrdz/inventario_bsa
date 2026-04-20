<?php

namespace App\Exceptions;

use RuntimeException;

class StockInsuficienteException extends RuntimeException
{
    public function __construct(string $message = 'Stock insuficiente para completar la operación.')
    {
        parent::__construct($message);
    }
}
