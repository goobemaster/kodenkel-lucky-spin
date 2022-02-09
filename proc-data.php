#!/usr/bin/php

<?php

const ROWS = 4;
const COLS = 12;
const MAX_CHARS = ROWS * COLS;
const VOID = ' ';

$inputData = json_decode(file_get_contents('./data-input.json'));
$procData = null;
$outputData = (object) ['proverb' => [], 'movie' => [], 'band' => []];
$sentence = '';
$blocks = '';

foreach (['proverb', 'movie', 'band'] as $category) {
    $procData = $inputData->{$category};

    for ($i = 0; $i < count($procData); $i++) {
        $sentence = $procData[$i][0];
        if (strlen($sentence) > MAX_CHARS) continue;
           
        $blocks = '';
        for ($line = 0; $line < 4; $line++) {
            $chunk = nextChunk($sentence);
            if (strlen($chunk) === 0 || strlen($chunk) > COLS) break;
            $blocks .= center($chunk);
        }
    
        if (strlen($sentence) !== 0) continue;
    
        $outputData->{$category}[] = $blocks;
    }
}

if (is_file('./data.json')) unlink('./data.json');
file_put_contents('./data.json', json_encode($outputData, JSON_PRETTY_PRINT));

exit(0);

// ----

function sanitize($sentence) {
    return strtoupper(trim($sentence));
}

function center($partial) {
    return str_pad($partial, COLS, VOID, STR_PAD_BOTH);
}

function nextChunk(&$sentence) {
    $words = explode(' ', $sentence);
    $wordSet = '';
    for ($i = 0; $i < count($words); $i++) {
        if (strlen($wordSet . $words[$i] . ' ') <= COLS) {
            $wordSet .= $words[$i] . ' ';
        } else {
            break;
        }
    }

    $sentence = substr($sentence, strlen($wordSet) - 1);
    return $wordSet;
}