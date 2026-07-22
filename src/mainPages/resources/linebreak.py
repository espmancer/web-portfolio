"""https://www.programiz.com/python-programming/online-compiler/"""
text = input().split(' ')
x = 0

for i in range(len(text)):
    if i == 10:
        x = 0
        print(text[i], end="\n")
    else:
        x += 1
        print(text[i], end=" ")