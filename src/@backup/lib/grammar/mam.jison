/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                       /* skip whitespace */
[0-9]+("."[0-9]+)?\b      return 'NUMBER';
"+"                       return '+';

/lex

%left '+' '-'

/* language grammar */

%start expressions

%%

expressions
	: e EOF
		{ console.log($1); return $1; }
	;

e
	: e '+' e
		{ $$ = $1 + $3; }
	;
