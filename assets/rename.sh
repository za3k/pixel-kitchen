a=0
for i in *.png; do
  new=$(printf "%d.png" "$a") #04 pad to length of 4
  mv -i -- "$i" "$new"
  let a=a+1
done
