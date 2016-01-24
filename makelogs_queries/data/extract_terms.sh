# Extract lowercased terms from text which occur between 10 and 999 times and are at least 4 characters long
tr '[:upper:]' '[:lower:]' | ( tr ' ' '\n' | sort | uniq -c | awk '{print $2"@"$1}') | perl -ne '/^([a-z]{4,})\@\d{2,3}$/ && print $1 . "\n"'
