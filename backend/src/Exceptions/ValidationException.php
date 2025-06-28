<?php

namespace App\Exceptions;

use Exception;

class ValidationException extends Exception
{
    protected $message = 'Validation failed';
    protected $code = 422;
    
    protected array $errors = [];
    
    public function __construct(string $message = '', array $errors = [])
    {
        parent::__construct($message);
        $this->errors = $errors;
    }
    
    public function getErrors(): array
    {
        return $this->errors;
    }
}
