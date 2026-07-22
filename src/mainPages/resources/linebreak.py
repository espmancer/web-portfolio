"""https://www.programiz.com/python-programming/online-compiler/"""
text = input().split()
x = 0

for word in text:
    print(word, end=" ")
    x += 1

    if x == 10:
        print()
        x = 0