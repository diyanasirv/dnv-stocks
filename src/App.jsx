import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

const ADMIN_PIN = '5840';

// Specific reviews for Egg Boiler and 3 Piece Drainer
const PRODUCT_SPECIFIC_REVIEWS = {
  egg_boiler: [
    { id: 'eb-11', name: 'Muhammed Shamil', rating: 5, comment: 'Works great.', date: 'Today' },
    { id: 'eb-12', name: 'Fathima Rihana', rating: 5, comment: 'Hostelil use cheyyan super convenient aanu.', date: 'Today' },
    { id: 'eb-13', name: 'Arjun Nair', rating: 4, comment: 'Small and useful. Fits nicely in my kitchen.', date: 'Today' },
    { id: 'eb-14', name: 'Aiswarya Menon', rating: 5, comment: 'I used it this morning and the eggs came out perfectly. Much easier than using a vessel.', date: 'Today' },
    { id: 'eb-15', name: 'Nihal Basheer', rating: 5, comment: 'Daily breakfast easy aayi.', date: 'Today' },
    { id: 'eb-16', name: 'Sreedevi Krishnan', rating: 5, comment: 'Soft boil setting is really good. Exactly the way I like my eggs.', date: 'Today' },
    { id: 'eb-17', name: 'Vishnu Prasad', rating: 4, comment: 'Simple to use and does the job well.', date: 'Today' },
    { id: 'eb-18', name: 'Hiba Fathima', rating: 5, comment: 'Roomil vechu egg boil cheyyan ithu valare helpful aanu.', date: 'Today' },
    { id: 'eb-19', name: 'Rakesh Kumar', rating: 5, comment: 'Seven eggs at once is perfect for our family breakfast.', date: '1 day ago' },
    { id: 'eb-20', name: 'Meera Suresh', rating: 4, comment: 'Good one.', date: '1 day ago' },
    { id: 'eb-21', name: 'Abdul Rahman', rating: 5, comment: 'First use was enough to convince me. No cracked eggs and everything cooked evenly.', date: '1 day ago' },
    { id: 'eb-22', name: 'Anju Thomas', rating: 5, comment: 'Morning rushil ithu oru lifesaver aanu.', date: '1 day ago' },
    { id: 'eb-23', name: 'Shahana Niyas', rating: 4, comment: 'Easy to clean after use.', date: '1 day ago' },
    { id: 'eb-24', name: 'Sanjay Menon', rating: 5, comment: 'I bought this because I eat boiled eggs almost every day. It saves me a lot of time now.', date: '1 day ago' },
    { id: 'eb-25', name: 'Devika Raj', rating: 5, comment: 'Compact design aanu enikku ettavum ishtapettathu.', date: '1 day ago' },
    { id: 'eb-26', name: 'Ashwin Babu', rating: 4, comment: 'Build quality is decent and the heating plate is easy to wipe.', date: '1 day ago' },
    { id: 'eb-27', name: 'Rizwana Salim', rating: 5, comment: 'Hard boiled eggs came out really nice.', date: '1 day ago' },
    { id: 'eb-28', name: 'Nandana Mohan', rating: 5, comment: 'Peeling the eggs is much easier now. Did not expect that difference.', date: '1 day ago' },
    { id: 'eb-29', name: 'Shyam Krishnan', rating: 4, comment: 'Very handy little machine.', date: '1 day ago' },
    { id: 'eb-30', name: 'Liya Jose', rating: 5, comment: 'Hostel studentsinu definitely recommend cheyyum.', date: '1 day ago' },
    { id: 'eb-31', name: 'Midhun K', rating: 5, comment: 'Timer nokki nilkkenda avashyam illa. Switch on cheythal pinne vere pani nokkam.', date: '1 day ago' },
    { id: 'eb-32', name: 'Greeshma Ravi', rating: 4, comment: 'So far, no issues.', date: '1 day ago' },
    { id: 'eb-33', name: 'Junaid P', rating: 5, comment: 'Auto shut-off works perfectly.', date: '2 days ago' },
    { id: 'eb-34', name: 'Athira S', rating: 5, comment: 'Measuring cup makes things easier. Just follow the level and switch it on.', date: '2 days ago' },
    { id: 'eb-35', name: 'Rahul Menon', rating: 4, comment: 'For someone living alone, this is much more convenient than boiling two eggs in a saucepan.', date: '2 days ago' },
    { id: 'eb-36', name: 'Naseema K', rating: 5, comment: 'Accessories okke useful aanu.', date: '2 days ago' },
    { id: 'eb-37', name: 'Adithyan Nair', rating: 5, comment: 'Different boiling options are a nice feature.', date: '2 days ago' },
    { id: 'eb-38', name: 'Saniya Rasheed', rating: 4, comment: 'Takes very little space on the counter.', date: '2 days ago' },
    { id: 'eb-39', name: 'Joel Mathew', rating: 5, comment: 'Office pokunnathinu munpu eggs ready aakki vechittu vere work cheyyan pattunnu.', date: '2 days ago' },
    { id: 'eb-40', name: 'Amrutha N', rating: 5, comment: 'Very consistent results so far.', date: '2 days ago' },
    { id: 'eb-41', name: 'Karthik Raj', rating: 5, comment: 'Meal prep cheyyunnavarkku useful aanu.', date: '2 days ago' },
    { id: 'eb-42', name: 'Keerthana S', rating: 4, comment: 'Small kitchen ullathukondu this size works perfectly for me.', date: '2 days ago' },
    { id: 'eb-43', name: 'Vishal Kumar', rating: 5, comment: 'Used it several times already. Everything is working smoothly.', date: '2 days ago' },
    { id: 'eb-44', name: 'Sumi Mohan', rating: 5, comment: 'Egg boil cheyyunnathu ithra easy aakumennu vicharichilla.', date: '2 days ago' },
    { id: 'eb-45', name: 'Akhil Das', rating: 4, comment: 'Heating plate quality looks good.', date: '2 days ago' },
    { id: 'eb-46', name: 'Nimisha Paul', rating: 5, comment: 'My kids like boiled eggs, so this has become a regular kitchen item for us.', date: '2 days ago' },
    { id: 'eb-47', name: 'Faisal K', rating: 5, comment: 'Gas stove use cheyyathe eggs prepare cheyyan pattunnathu convenient aanu.', date: '2 days ago' },
    { id: 'eb-48', name: 'Reshma Pradeep', rating: 4, comment: 'Easy storage and easy cleaning.', date: '2 days ago' },
    { id: 'eb-49', name: 'Naveen Thomas', rating: 5, comment: 'I use it almost every morning. Very reliable so far.', date: '3 days ago' },
    { id: 'eb-50', name: 'Mariya Jose', rating: 5, comment: 'Morning breakfast prepare cheyyan nalla help aanu.', date: '3 days ago' },
    { id: 'eb-51', name: 'Sreehari P', rating: 4, comment: 'Worth the money.', date: '3 days ago' },
    { id: 'eb-52', name: 'Anagha Krishnan', rating: 5, comment: 'Medium boiled eggs are coming out exactly right.', date: '3 days ago' },
    { id: 'eb-53', name: 'Shafeeq Ali', rating: 5, comment: 'Packaging was neat and the item arrived without any damage. Tried it the same day and it worked well.', date: '3 days ago' },
    { id: 'eb-54', name: 'Diya Nair', rating: 4, comment: 'Looks neat and works well.', date: '3 days ago' },
    { id: 'eb-55', name: 'Manu Joseph', rating: 5, comment: 'No more checking the water again and again. Auto cut-off is very useful.', date: '3 days ago' },
    { id: 'eb-56', name: 'Haniya P', rating: 5, comment: 'Hostel roomil vechu use cheyyan perfect aanu.', date: '3 days ago' },
    { id: 'eb-57', name: 'Ranjith Kumar', rating: 4, comment: 'Good build.', date: '3 days ago' },
    { id: 'eb-58', name: 'Fathima Shirin', rating: 5, comment: 'Shells come off quite easily after boiling.', date: '3 days ago' },
    { id: 'eb-59', name: 'Sanjana R', rating: 5, comment: 'College pokanulla rushil this helps a lot.', date: '3 days ago' },
    { id: 'eb-60', name: 'Niyas Ahmed', rating: 4, comment: 'Simple product and good performance for the price.', date: '3 days ago' },
    { id: 'eb-61', name: 'Kavya Menon', rating: 5, comment: 'Cleaning is much easier than I expected.', date: '3 days ago' },
    { id: 'eb-62', name: 'Suraj S', rating: 5, comment: 'Quick breakfast without using the stove.', date: '3 days ago' },
    { id: 'eb-63', name: 'Amina Latheef', rating: 4, comment: 'It fits nicely even in my small apartment kitchen.', date: '3 days ago' },
    { id: 'eb-64', name: 'Jithin Raj', rating: 5, comment: 'Time save cheyyunnathu thanne biggest advantage.', date: '4 days ago' },
    { id: 'eb-65', name: 'Swathi Krishna', rating: 5, comment: 'Water measurement correct aayal result consistent aanu.', date: '4 days ago' },
    { id: 'eb-66', name: 'Afsal P', rating: 4, comment: 'The stainless steel plate is easy to maintain.', date: '4 days ago' },
    { id: 'eb-67', name: 'Anjali Ramesh', rating: 5, comment: 'We prepare eggs almost every day now. Much less effort compared to the old method.', date: '4 days ago' },
    { id: 'eb-68', name: 'Shameer K', rating: 5, comment: 'Daily use cheyyunnu. No complaints till now.', date: '4 days ago' },
    { id: 'eb-69', name: 'Malavika S', rating: 4, comment: 'Good value for money.', date: '4 days ago' },
    { id: 'eb-70', name: 'Irfan Rahman', rating: 5, comment: 'Seven eggs together is very convenient when preparing food for the family.', date: '4 days ago' },
    { id: 'eb-71', name: 'Lakshmi Priya', rating: 5, comment: 'Very useful for my morning routine.', date: '4 days ago' },
    { id: 'eb-72', name: 'Arun Vijay', rating: 4, comment: 'Romba convenient ah irukku. Breakfast-ku time save aaguthu.', date: '4 days ago' },
    { id: 'eb-73', name: 'Divya Mohan', rating: 5, comment: 'Soft boil cheythappol result super aayirunnu.', date: '4 days ago' },
    { id: 'eb-74', name: 'Siddharth Nair', rating: 5, comment: 'The automatic function is the main reason I prefer this over normal boiling.', date: '4 days ago' },
    { id: 'eb-75', name: 'Roshni Thomas', rating: 4, comment: 'Compact and lightweight.', date: '4 days ago' },
    { id: 'eb-76', name: 'Muhammed Riyas', rating: 5, comment: 'Bachelorsinu nalla option aanu. Breakfast easy aayi.', date: '4 days ago' },
    { id: 'eb-77', name: 'Sowmya K', rating: 5, comment: 'Every egg was cooked evenly.', date: '5 days ago' },
    { id: 'eb-78', name: 'Pranav Suresh', rating: 4, comment: 'No complicated setup, which I liked.', date: '5 days ago' },
    { id: 'eb-79', name: 'Aysha N', rating: 5, comment: 'The little egg pin is actually useful. I did not expect to use it this much.', date: '5 days ago' },
    { id: 'eb-80', name: 'Hari Krishnan', rating: 5, comment: 'Regular vesselil boil cheyyunnathinekkal ithu much easier aanu.', date: '5 days ago' },
    { id: 'eb-81', name: 'Meenakshi R', rating: 5, comment: 'Tamil Nadu il ninnu order cheythu. First impression itself is good.', date: '5 days ago' },
    { id: 'eb-82', name: 'Karthik S', rating: 4, comment: 'Seven eggs capacity is useful for our family.', date: '5 days ago' },
    { id: 'eb-83', name: 'Priyanka Devi', rating: 5, comment: 'Romba convenient ah irukku. Morning time save aaguthu.', date: '5 days ago' },
    { id: 'eb-84', name: 'Dinesh Kumar', rating: 5, comment: 'Auto cut-off works properly.', date: '5 days ago' },
    { id: 'eb-85', name: 'Harini M', rating: 4, comment: 'Hostel use-ku suitable size.', date: '5 days ago' },
    { id: 'eb-86', name: 'Suresh Babu', rating: 5, comment: 'Good for daily boiled eggs.', date: '5 days ago' },
    { id: 'eb-87', name: 'Nivetha R', rating: 5, comment: 'Romba easy ah use panna mudiyuthu. Cleaning is also simple.', date: '5 days ago' },
    { id: 'eb-88', name: 'Vignesh P', rating: 4, comment: 'Small but useful appliance.', date: '5 days ago' },
    { id: 'eb-89', name: 'Keerthana S', rating: 5, comment: 'I bought it mainly for breakfast and now I use it almost every day.', date: '5 days ago' },
    { id: 'eb-90', name: 'Mahalakshmi K', rating: 5, comment: 'Different settings are useful because everyone at home prefers eggs differently.', date: '6 days ago' },
    { id: 'eb-91', name: 'Praveen Raj', rating: 4, comment: 'Works as expected.', date: '6 days ago' },
    { id: 'eb-92', name: 'Divya Sri', rating: 5, comment: 'Romba useful. Morning preparation quick ah mudinjiduthu.', date: '6 days ago' },
    { id: 'eb-93', name: 'Lokesh Kumar', rating: 5, comment: 'Much easier than boiling eggs in a normal vessel.', date: '6 days ago' },
    { id: 'eb-94', name: 'Sangeetha M', rating: 4, comment: 'Even cooking and simple cleaning.', date: '6 days ago' },
    { id: 'eb-95', name: 'Balaji R', rating: 5, comment: 'Auto shut-off worked perfectly during my first few uses.', date: '6 days ago' },
    { id: 'eb-96', name: 'Pavithra S', rating: 5, comment: 'Hostel use-ku perfect size. Carry cheyyanum easy.', date: '6 days ago' },
    { id: 'eb-97', name: 'Surya Prakash', rating: 4, comment: 'Good appliance for regular egg eaters.', date: '6 days ago' },
    { id: 'eb-98', name: 'Deepika R', rating: 5, comment: 'Heats quickly and gives good results.', date: '6 days ago' },
    { id: 'eb-99', name: 'Manoj Kumar', rating: 5, comment: 'Romba useful for busy mornings.', date: '6 days ago' },
    { id: 'eb-100', name: 'Anitha S', rating: 4, comment: 'Nice little boiler.', date: '6 days ago' },
    { id: 'eb-101', name: 'Suresh Menon', rating: 5, comment: 'Bought this for my daughter who stays in a hostel. She says it is very easy to use.', date: '6 days ago' },
    { id: 'eb-102', name: 'Nandini P', rating: 5, comment: 'Consistent results every time.', date: '1 week ago' },
    { id: 'eb-103', name: 'Riyas Mohammed', rating: 4, comment: 'Use cheyyan simple aanu. Cleaningum easy.', date: '1 week ago' },
    { id: 'eb-104', name: 'Gopika Raj', rating: 5, comment: 'Meal prep cheyyumbol ithu nalla time save cheyyunnu.', date: '1 week ago' },
    { id: 'eb-105', name: 'Shahin P', rating: 5, comment: 'Heating plate clean cheyyan easy aanu.', date: '1 week ago' },
    { id: 'eb-106', name: 'Reshma Nair', rating: 4, comment: 'Lightweight and easy to store.', date: '1 week ago' },
    { id: 'eb-107', name: 'Abhinav S', rating: 5, comment: 'Used it every day this week. Still working perfectly.', date: '1 week ago' },
    { id: 'eb-108', name: 'Fazna Fathima', rating: 5, comment: 'College daysil breakfast prepare cheyyan ithu really helpful aanu.', date: '1 week ago' },
    { id: 'eb-109', name: 'Rohit Kumar', rating: 4, comment: 'Reasonable price and good performance.', date: '1 week ago' },
    { id: 'eb-110', name: 'Lekshmi S', rating: 5, comment: 'No need to keep checking the pot anymore.', date: '1 week ago' },
    { id: 'eb-111', name: 'Midhun Raj', rating: 5, comment: 'Piercing pin is useful for avoiding cracks.', date: '2 weeks ago' },
    { id: 'eb-112', name: 'Aparna N', rating: 4, comment: 'Good for a small family. The capacity is enough for us.', date: '2 weeks ago' },
    { id: 'eb-113', name: 'Shameena K', rating: 5, comment: 'Daily use cheyyunnu and so far reliable aanu.', date: '2 weeks ago' },
    { id: 'eb-114', name: 'Nikhil Jose', rating: 5, comment: 'The biggest advantage is that I can prepare the eggs while doing other things.', date: '2 weeks ago' },
    { id: 'eb-115', name: 'Sreya Menon', rating: 4, comment: 'Simple design. Good for breakfast.', date: '2 weeks ago' },
    { id: 'eb-116', name: 'Ameen K', rating: 5, comment: 'Stove use kuranju. Egg preparationinu easy option aanu.', date: '2 weeks ago' },
    { id: 'eb-117', name: 'Anusha P', rating: 5, comment: 'Very little effort needed.', date: '2 weeks ago' },
    { id: 'eb-118', name: 'Firoz Ahmed', rating: 4, comment: 'Works well and does not require much maintenance.', date: '2 weeks ago' },
    { id: 'eb-119', name: 'Riya Thomas', rating: 5, comment: 'Really useful kitchen gadget.', date: '3 weeks ago' },
    { id: 'eb-120', name: 'Abdul Hadi', rating: 5, comment: 'Hostelil use cheyyan best. Small and easy to handle.', date: '3 weeks ago' },
    { id: 'eb-121', name: 'Sanjay Kumar', rating: 4, comment: 'Good performance and compact design.', date: '3 weeks ago' },
    { id: 'eb-122', name: 'Radhika S', rating: 5, comment: 'Auto shut-off makes it much easier to use than a normal pot.', date: '3 weeks ago' },
    { id: 'eb-123', name: 'Naseer P', rating: 5, comment: 'Gas stoveil pan use cheyyunnathinekkal simple aanu.', date: '3 weeks ago' },
    { id: 'eb-124', name: 'Ananya Raj', rating: 4, comment: 'Good for regular breakfast use.', date: '1 month ago' },
    { id: 'eb-125', name: 'Shabna Latheef', rating: 5, comment: 'Cleaning takes only a few minutes. Still looks good after regular use.', date: '1 month ago' },
    { id: 'eb-126', name: 'Vivek Nair', rating: 5, comment: 'I mostly use the hard boil option and it has been working nicely.', date: '1 month ago' },
    { id: 'eb-127', name: 'Asha Mohan', rating: 4, comment: 'Small, straightforward and useful.', date: '1 month ago' },
    { id: 'eb-128', name: 'Rashid K', rating: 5, comment: 'Eggs ready aakunnathu vare wait cheyyenda avashyam illa.', date: '1 month ago' },
    { id: 'eb-129', name: 'Gayathri S', rating: 5, comment: 'Perfect for busy mornings and weekly meal preparation.', date: '1 month ago' },
    { id: 'eb-130', name: 'Akshay Kumar', rating: 4, comment: 'Controls are easy to understand and the machine works as expected.', date: '1 month ago' },
    { id: 'eb-131', name: 'Shahana F', rating: 5, comment: 'College daysil breakfast prepare cheyyan valare convenient aanu.', date: '1 month ago' },
    { id: 'eb-132', name: 'Hari Prasad', rating: 5, comment: 'Even cooking and automatic shut-off. Happy with it.', date: '1 month ago' },
    { id: 'eb-133', name: 'Amal Dev', rating: 4, comment: 'Decent build and easy to store.', date: '1 month ago' },
    { id: 'eb-134', name: 'Fathima Niyas', rating: 5, comment: 'A friend recommended this to me and I am glad I bought it.', date: '1 month ago' },
    { id: 'eb-135', name: 'Sreelekshmi P', rating: 5, comment: 'Breakfast preparationinu extra vessel wash cheyyenda avashyam kuranju.', date: '1 month ago' },
    { id: 'eb-136', name: 'Vimal Kumar', rating: 4, comment: 'Good option for bachelors.', date: '1 month ago' },
    { id: 'eb-137', name: 'Akhila Raj', rating: 5, comment: 'Automatic function is my favourite part. Makes the whole process almost effortless.', date: '1 month ago' },
    { id: 'eb-138', name: 'Jaseem P', rating: 5, comment: 'Price-wise it is worth considering if you eat eggs regularly.', date: '1 month ago' },
    { id: 'eb-139', name: 'Maya Krishnan', rating: 5, comment: 'I have tried boiling eggs in a pan, pressure cooker and now this. For everyday use, this is definitely the easiest method for me.', date: '1 month ago' }
  ],
  drainer: [
    { id: 'dr-11', name: 'Muhammed Riyas', rating: 5, comment: 'Kitchenil daily use cheyyunnu. Very handy.', date: 'Today' },
    { id: 'dr-12', name: 'Anjali Nair', rating: 5, comment: 'Three sizes kittunnathu kond different things wash cheyyan easy aanu.', date: 'Today' },
    { id: 'dr-13', name: 'Karthik S', rating: 4, comment: 'Useful set for the kitchen.', date: 'Today' },
    { id: 'dr-14', name: 'Fathima Shirin', rating: 5, comment: 'Vegetables wash cheythu drain cheyyan nalla convenient aanu. Cabinetilum space kurachu mathi.', date: 'Today' },
    { id: 'dr-15', name: 'Arun Raj', rating: 5, comment: 'Rice washinginu especially useful.', date: 'Today' },
    { id: 'dr-16', name: 'Meenakshi R', rating: 4, comment: 'Three pieces are actually useful, not just extra pieces.', date: 'Today' },
    { id: 'dr-17', name: 'Nikhil Menon', rating: 5, comment: 'Size options are perfect for different quantities.', date: '1 day ago' },
    { id: 'dr-18', name: 'Shahana P', rating: 5, comment: 'Lightweight aanu, handle cheyyanum easy.', date: '1 day ago' },
    { id: 'dr-19', name: 'Vignesh Kumar', rating: 5, comment: 'Romba useful kitchen item. Fruits wash panna super ah irukku.', date: '1 day ago' },
    { id: 'dr-20', name: 'Amrutha S', rating: 4, comment: 'Good quality for this price.', date: '1 day ago' },
    { id: 'dr-21', name: 'Afsal K', rating: 5, comment: 'Water quickly drains through the holes and the food stays inside.', date: '1 day ago' },
    { id: 'dr-22', name: 'Devika Mohan', rating: 5, comment: 'Small one is perfect for washing berries and small fruits.', date: '1 day ago' },
    { id: 'dr-23', name: 'Sanjay Nair', rating: 4, comment: 'Easy to clean and store.', date: '1 day ago' },
    { id: 'dr-24', name: 'Hiba Fathima', rating: 5, comment: 'Hostel kitchenil use cheyyan convenient aanu.', date: '1 day ago' },
    { id: 'dr-25', name: 'Priyanka Devi', rating: 5, comment: 'Pasta drain cheyyumbol water quickly pokunnu. No problem so far.', date: '1 day ago' },
    { id: 'dr-26', name: 'Rahul Das', rating: 4, comment: 'Nice set. All three sizes have different uses.', date: '2 days ago' },
    { id: 'dr-27', name: 'Sreedevi Krishnan', rating: 5, comment: 'Vegetables wash cheyyan njan mostly use cheyyunnu. Very comfortable.', date: '2 days ago' },
    { id: 'dr-28', name: 'Abdul Hadi', rating: 5, comment: 'The plastic feels reasonably thick and does not bend easily.', date: '2 days ago' },
    { id: 'dr-29', name: 'Lakshmi Priya', rating: 5, comment: 'Romba easy to use and clean.', date: '2 days ago' },
    { id: 'dr-30', name: 'Midhun P', rating: 4, comment: 'Good for rice and vegetables.', date: '2 days ago' },
    { id: 'dr-31', name: 'Aparna Thomas', rating: 5, comment: 'I like that they can be kept one inside another. Saves cabinet space.', date: '2 days ago' },
    { id: 'dr-32', name: 'Junaid Rahman', rating: 5, comment: 'Handle grip is comfortable and the bigger one is quite spacious.', date: '2 days ago' },
    { id: 'dr-33', name: 'Nivetha S', rating: 5, comment: 'Kitchen use-ku romba practical ah irukku.', date: '2 days ago' },
    { id: 'dr-34', name: 'Gopika Raj', rating: 4, comment: 'Simple product but very useful.', date: '2 days ago' },
    { id: 'dr-35', name: 'Vishnu Prasad', rating: 5, comment: 'After washing rice, the excess water comes out quickly. That is the main thing I wanted.', date: '2 days ago' },
    { id: 'dr-36', name: 'Aiswarya Menon', rating: 5, comment: 'Three different sizes make this set much more useful than buying one drainer.', date: '3 days ago' },
    { id: 'dr-37', name: 'Faisal P', rating: 4, comment: 'Light and easy to handle.', date: '3 days ago' },
    { id: 'dr-38', name: 'Harini M', rating: 5, comment: 'Fruits wash cheythu fridgeil vekkan ithu use cheyyunnu.', date: '3 days ago' },
    { id: 'dr-39', name: 'Suresh Babu', rating: 5, comment: 'Good drainage and decent build.', date: '3 days ago' },
    { id: 'dr-40', name: 'Nandana K', rating: 4, comment: 'The smaller bowls are handy for smaller portions.', date: '3 days ago' },
    { id: 'dr-41', name: 'Rohit Kumar', rating: 5, comment: 'I bought this mainly for washing rice. Now I use all three pieces regularly.', date: '3 days ago' },
    { id: 'dr-42', name: 'Shameena Latheef', rating: 5, comment: 'Wash cheythal water nannayi drain aakunnu. Very convenient.', date: '3 days ago' },
    { id: 'dr-43', name: 'Balaji R', rating: 4, comment: 'Useful for noodles and pasta too.', date: '3 days ago' },
    { id: 'dr-44', name: 'Reshma Nair', rating: 5, comment: 'The different sizes are useful when preparing food for different quantities.', date: '3 days ago' },
    { id: 'dr-45', name: 'Akhil Joseph', rating: 5, comment: 'Good addition to my kitchen.', date: '3 days ago' },
    { id: 'dr-46', name: 'Naseema K', rating: 5, comment: 'Easy to wash after use and dries quickly.', date: '4 days ago' },
    { id: 'dr-47', name: 'Siddharth Nair', rating: 4, comment: 'Plastic quality is decent.', date: '4 days ago' },
    { id: 'dr-48', name: 'Divya Sri', rating: 5, comment: 'Vegetable cleaning became much easier after buying this set.', date: '4 days ago' },
    { id: 'dr-49', name: 'Lokesh Kumar', rating: 5, comment: 'Three pieces are enough for our daily cooking needs.', date: '4 days ago' },
    { id: 'dr-50', name: 'Aysha N', rating: 5, comment: 'Kitchenil space kuravayathukondu stack cheyyan pattunnathu useful aanu.', date: '4 days ago' },
    { id: 'dr-51', name: 'Manu Jose', rating: 4, comment: 'Handles feel comfortable while washing vegetables.', date: '4 days ago' },
    { id: 'dr-52', name: 'Sangeetha M', rating: 5, comment: 'Romba useful for draining pasta. Water mattum quick ah poiduthu.', date: '4 days ago' },
    { id: 'dr-53', name: 'Niyas Ahmed', rating: 5, comment: 'No sharp edges and easy to clean.', date: '4 days ago' },
    { id: 'dr-54', name: 'Keerthana S', rating: 4, comment: 'Good set for regular household use.', date: '4 days ago' },
    { id: 'dr-55', name: 'Shahin P', rating: 5, comment: 'I use the medium one almost every day for vegetables and fruits.', date: '5 days ago' },
    { id: 'dr-56', name: 'Arun Vijay', rating: 5, comment: 'Rice wash panna romba easy ah irukku.', date: '5 days ago' },
    { id: 'dr-57', name: 'Anagha Krishnan', rating: 4, comment: 'Simple and practical.', date: '5 days ago' },
    { id: 'dr-58', name: 'Firoz Ahmed', rating: 5, comment: 'The holes are small enough that rice does not easily escape while draining.', date: '5 days ago' },
    { id: 'dr-59', name: 'Mariya Jose', rating: 5, comment: 'Three sizes kittiyathu kond enikku separate bowls vangenda vannilla.', date: '5 days ago' },
    { id: 'dr-60', name: 'Praveen S', rating: 4, comment: 'Looks good and works properly.', date: '5 days ago' },
    { id: 'dr-61', name: 'Radhika Menon', rating: 5, comment: 'Very useful while washing leafy vegetables. Water drains nicely without making a mess.', date: '5 days ago' },
    { id: 'dr-62', name: 'Muhammed Shamil', rating: 5, comment: 'Daily kitchen workinu handy aanu.', date: '6 days ago' },
    { id: 'dr-63', name: 'Pavithra R', rating: 5, comment: 'I like the nesting design. After use all three can be stored together.', date: '6 days ago' },
    { id: 'dr-64', name: 'Karthik Raj', rating: 4, comment: 'Romba convenient for washing fruits.', date: '6 days ago' },
    { id: 'dr-65', name: 'Haniya P', rating: 5, comment: 'Lightweight, spacious and easy to rinse.', date: '6 days ago' },
    { id: 'dr-66', name: 'Vivek Nair', rating: 5, comment: 'Good purchase for a small kitchen.', date: '6 days ago' },
    { id: 'dr-67', name: 'Amina Latheef', rating: 4, comment: 'The smallest one is surprisingly useful for small portions.', date: '1 week ago' },
    { id: 'dr-68', name: 'Nikhil Jose', rating: 5, comment: 'I use these for rice, vegetables, fruits and sometimes noodles. Having three sizes makes it easier to pick the right one.', date: '1 week ago' },
    { id: 'dr-69', name: 'Mahalakshmi K', rating: 5, comment: 'Wash panna easy, drain panna easy. Good one.', date: '1 week ago' },
    { id: 'dr-70', name: 'Abhinav Thomas', rating: 4, comment: 'Decent quality and useful sizes.', date: '1 week ago' },
    { id: 'dr-71', name: 'Saniya Rasheed', rating: 5, comment: 'Kitchenil daily use cheyyunna itemsil onnu aayi.', date: '1 week ago' },
    { id: 'dr-72', name: 'Vignesh P', rating: 5, comment: 'Romba handy set. Especially for rice washing and pasta.', date: '2 weeks ago' },
    { id: 'dr-73', name: 'Nimisha Paul', rating: 4, comment: 'Easy to store because the three pieces fit together.', date: '2 weeks ago' },
    { id: 'dr-74', name: 'Riyas Mohammed', rating: 5, comment: 'Good for everyday cooking. Plastic is also easy to wash.', date: '2 weeks ago' },
    { id: 'dr-75', name: 'Sreya Menon', rating: 5, comment: 'Different sizes are genuinely useful for different ingredients.', date: '2 weeks ago' },
    { id: 'dr-76', name: 'Dinesh Kumar', rating: 4, comment: 'Simple product, but it has made washing and draining food much easier.', date: '3 weeks ago' },
    { id: 'dr-77', name: 'Fathima Niyas', rating: 5, comment: 'I was looking for a basic drainer set and this one matched what I needed. The three sizes are convenient and storage is easy.', date: '3 weeks ago' },
    { id: 'dr-78', name: 'Surya Prakash', rating: 5, comment: 'Useful kitchen set.', date: '1 month ago' }
  ]
};

// Generic fallback reviews for any other added product
const DEFAULT_REVIEWS = [
  { id: 'gen-1', name: 'Rajesh Sharma', rating: 5, comment: 'Excellent product! Exceeded my expectations completely.', date: '2 days ago' },
  { id: 'gen-2', name: 'Suman Lata', rating: 5, comment: 'Fast delivery and premium packaging. Highly recommended!', date: '3 days ago' },
  { id: 'gen-3', name: 'Alok Gupta', rating: 4, comment: 'Great value for money. Very satisfied with the purchase.', date: '5 days ago' },
  { id: 'gen-4', name: 'Preeti Sun', rating: 5, comment: 'Top quality product! Will definitely buy again.', date: '1 week ago' },
  { id: 'gen-5', name: 'Manoj Bajpayee', rating: 4, comment: 'Good build quality and works exactly as described.', date: '1 week ago' },
  { id: 'gen-6', name: 'Sunita Menon', rating: 5, comment: 'Loved it! Extremely useful and easy to operate.', date: '2 weeks ago' },
  { id: 'gen-7', name: 'Vijay Anand', rating: 4, comment: 'Prompt delivery and smooth checkout process.', date: '2 weeks ago' },
  { id: 'gen-8', name: 'Geeta Rani', rating: 5, comment: 'Item arrived safely wrapped without damage.', date: '3 weeks ago' },
  { id: 'gen-9', name: 'Sandeep Khurana', rating: 5, comment: 'Superb quality! Worth every single rupee spent.', date: '3 weeks ago' },
  { id: 'gen-10', name: 'Ankita Lokhande', rating: 4, comment: 'Nice product quality. Fits my everyday needs well.', date: '1 month ago' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckout, setIsCheckout] = useState(false);

  // Admin Auth States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    pincode: '',
    payment_method: 'ONLINE',
    transaction_id: ''
  });

  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch dynamic products from Supabase
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Check URL path on initial render to detect direct access to /admin
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      if (isAdminAuthenticated) {
        setActiveTab('admin');
      } else {
        setShowPinModal(true);
      }
    }
  }, [isAdminAuthenticated]);

  // Real-time listener cleanup for tracked order
  useEffect(() => {
    if (!trackedOrder) return;

    const channel = supabase
      .channel(`public:orders:order_id=eq.${trackedOrder.order_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${trackedOrder.order_id}`
        },
        (payload) => {
          if (payload.new) {
            setTrackedOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackedOrder?.order_id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOrderId = () => {
    return 'DNV-' + Math.floor(100000 + Math.random() * 900000);
  };

  const getFinalPrice = () => {
    if (!selectedProduct) return 0;
    const basePrice = Number(selectedProduct.price) || 0;
    return formData.payment_method === 'COD' ? basePrice + 10 : basePrice;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.payment_method === 'ONLINE' && !formData.transaction_id.trim()) {
      alert('Please enter your UPI Transaction/UTR ID');
      setLoading(false);
      return;
    }

    const newOrderId = generateOrderId();
    const finalAmount = getFinalPrice();

    const { error } = await supabase.from('orders').insert([
      {
        order_id: newOrderId,
        product_name: selectedProduct.name,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        payment_method: formData.payment_method,
        transaction_id: formData.payment_method === 'ONLINE' ? formData.transaction_id : null,
        order_status: 'Processing',
        amount: finalAmount
      }
    ]);

    setLoading(false);

    if (error) {
      alert('Failed to place order: ' + error.message);
    } else {
      setPlacedOrderId(newOrderId);
      setSelectedProduct(null);
      setIsCheckout(false);
    }
  };

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);

    const cleanOrderId = searchOrderId.trim();
    if (!cleanOrderId) {
      setTrackError('Please enter an Order ID.');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', cleanOrderId)
      .single();

    if (error || !data) {
      setTrackError('Order not found. Please check your Order ID.');
    } else {
      setTrackedOrder(data);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('diyanasir01-2@oksbi');
    alert('UPI ID copied to clipboard!');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      setShowPinModal(false);
      setActiveTab('admin');
    } else {
      setPinError('Incorrect PIN. Access Denied.');
    }
  };

  const handleClosePinModal = () => {
    setShowPinModal(false);
    window.history.pushState({}, '', '/');
    setActiveTab('shop');
  };

  // Helper to select specific review list and compute stats dynamically
  const getReviewData = (product) => {
    if (!product) return { reviews: [], count: 0, avgRating: '4.8' };
    const name = (product.name || '').toLowerCase();

    let reviews = DEFAULT_REVIEWS;
    if (name.includes('egg') || name.includes('boiler')) {
      reviews = PRODUCT_SPECIFIC_REVIEWS.egg_boiler;
    } else if (name.includes('drain') || name.includes('strainer') || name.includes('3 piece')) {
      reviews = PRODUCT_SPECIFIC_REVIEWS.drainer;
    }

    const count = reviews.length;
    const avgRating = count > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1) 
      : '4.8';

    return { reviews, count, avgRating };
  };

  const currentReviewData = selectedProduct ? getReviewData(selectedProduct) : { reviews: [], count: 0, avgRating: '4.8' };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Navbar */}
      <nav className="navbar sticky-top bg-white border-bottom shadow-sm py-2">
        <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold text-primary fs-4 m-0">DNV Stocks</span>
          <div className="btn-group" role="group">
            <button 
              className={`btn btn-sm ${activeTab === 'shop' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`} 
              onClick={() => { setActiveTab('shop'); setPlacedOrderId(null); setSelectedProduct(null); setIsCheckout(false); fetchProducts(); window.history.pushState({}, '', '/'); }}>
              Shop
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'track' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`} 
              onClick={() => { setActiveTab('track'); window.history.pushState({}, '', '/track'); }}>
              Track
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-3 pt-3" style={{ maxWidth: '600px' }}>
        {/* SHOP SECTION */}
        {activeTab === 'shop' && (
          <div>
            {placedOrderId ? (
              <div className="card shadow-sm border-0 text-center p-3">
                <div className="card-body p-2">
                  <div className="text-success mb-2 display-4">🎉</div>
                  <h3 className="card-title text-success fw-bold fs-4">Order Placed!</h3>
                  <p className="text-muted small mb-2">Your unique Order ID is:</p>
                  <div className="bg-light p-3 rounded border fs-3 fw-bold text-primary my-2 user-select-all">
                    {placedOrderId}
                  </div>
                  <div className="alert alert-warning text-dark fw-bold small my-3" role="alert">
                    📸 <strong>Important:</strong> Take a screenshot or copy this Order ID to track your order!
                  </div>
                  <button 
                    onClick={() => { setPlacedOrderId(null); fetchProducts(); }} 
                    className="btn btn-primary w-100 py-3 fw-bold fs-6">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : !selectedProduct ? (
              /* PRODUCT LIST VIEW */
              <div>
                {loadingProducts ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="card border-0 shadow-sm text-center p-4">
                    <p className="text-muted m-0">No products available at the moment.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {products.map((prod) => {
                      const { count, avgRating } = getReviewData(prod);
                      return (
                        <div 
                          key={prod.id} 
                          className="card shadow-sm border-0 rounded-3 overflow-hidden"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedProduct(prod)}
                        >
                          <img 
                            src={prod.image || 'https://via.placeholder.com/300'} 
                            className="card-img-top object-fit-cover" 
                            alt={prod.name} 
                            style={{ height: '220px' }} 
                          />
                          <div className="card-body p-3">
                            <h5 className="card-title fw-bold fs-5 mb-1">{prod.name}</h5>
                            <div className="d-flex align-items-center gap-1 mb-2">
                              <span className="text-warning fw-bold fs-6">★ {avgRating}</span>
                              <span className="text-muted small">({count} reviews)</span>
                            </div>
                            <p className="card-text text-muted small mb-3">{prod.description}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fs-3 fw-bold text-danger">₹{prod.price}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }} 
                                className="btn btn-primary fw-bold px-4 py-2 fs-6">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : !isCheckout ? (
              /* SEPARATE PRODUCT PAGE VIEW */
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-3">
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="btn btn-light btn-sm fw-semibold mb-3 border w-100 py-2">
                    ← Back to Products
                  </button>

                  <img 
                    src={selectedProduct.image || 'https://via.placeholder.com/300'} 
                    alt={selectedProduct.name} 
                    className="w-100 rounded-3 object-fit-cover mb-3" 
                    style={{ maxHeight: '300px' }} 
                  />

                  <h4 className="fw-bold fs-4 mb-1">{selectedProduct.name}</h4>
                  
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-success fs-6 py-1 px-2">{currentReviewData.avgRating} ★</span>
                    <span className="text-muted small font-weight-semibold">{currentReviewData.count} Verified Reviews</span>
                  </div>

                  <div className="mb-3">
                    <span className="fs-2 fw-bold text-danger me-2">₹{selectedProduct.price}</span>
                    <span className="badge bg-light text-success border border-success">In Stock</span>
                  </div>

                  <p className="text-secondary mb-4">{selectedProduct.description}</p>

                  <button 
                    onClick={() => setIsCheckout(true)} 
                    className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm mb-4">
                    Buy Now
                  </button>

                  <hr className="my-4" />

                  {/* PRODUCT SPECIFIC REVIEWS */}
                  <div>
                    <h5 className="fw-bold mb-3">Customer Reviews for {selectedProduct.name} ({currentReviewData.count})</h5>
                    <div className="d-flex flex-column gap-3">
                      {currentReviewData.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-light rounded border">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className="small">{rev.name}</strong>
                            <span className="text-muted fs-7">{rev.date}</span>
                          </div>
                          <div className="text-warning small mb-1">
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                          <p className="m-0 text-dark small">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* CHECKOUT FORM VIEW */
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-3">
                  <button 
                    onClick={() => setIsCheckout(false)} 
                    className="btn btn-light btn-sm fw-semibold mb-3 border w-100 py-2">
                    ← Back to Product Details
                  </button>

                  <div className="d-flex align-items-center gap-3 p-2 bg-light rounded mb-3 border">
                    <img 
                      src={selectedProduct.image || 'https://via.placeholder.com/60'} 
                      alt={selectedProduct.name} 
                      className="rounded object-fit-cover" 
                      style={{ width: '60px', height: '60px' }} 
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{selectedProduct.name}</h6>
                      <span className="fs-5 text-danger fw-bold">Total: ₹{getFinalPrice()}</span>
                    </div>
                  </div>

                  <form onSubmit={handleOrderSubmit}>
                    <h6 className="fw-bold text-uppercase text-muted small mb-2">Delivery Details</h6>
                    <div className="mb-2">
                      <input type="text" name="customer_name" className="form-control form-control-lg fs-6" placeholder="Full Name" required value={formData.customer_name} onChange={handleInputChange} />
                    </div>
                    <div className="mb-2">
                      <input type="tel" name="phone" className="form-control form-control-lg fs-6" placeholder="Mobile Number" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="mb-2">
                      <textarea name="address" className="form-control fs-6" rows="3" placeholder="Full Delivery Address" required value={formData.address} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="mb-3">
                      <input type="text" name="pincode" className="form-control form-control-lg fs-6" placeholder="Pincode" required value={formData.pincode} onChange={handleInputChange} />
                    </div>

                    <h6 className="fw-bold text-uppercase text-muted small mb-2">Payment Method</h6>
                    
                    {/* ONLINE PAYMENT FIRST */}
                    <div className="card p-2 mb-2 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="online" value="ONLINE" checked={formData.payment_method === 'ONLINE'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold" htmlFor="online">
                          Online Payment (UPI / QR Code)
                        </label>
                      </div>
                    </div>

                    {/* CASH ON DELIVERY SECOND WITH +₹10 NOTICE */}
                    <div className="card p-2 mb-3 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="cod" value="COD" checked={formData.payment_method === 'COD'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold d-flex justify-content-between align-items-center" htmlFor="cod">
                          <span>Cash on Delivery (COD)</span>
                          <span className="badge bg-warning text-dark small">+₹10 Charge</span>
                        </label>
                      </div>
                    </div>

                    {formData.payment_method === 'COD' && (
                      <div className="alert alert-info py-2 small mb-3">
                        ℹ️ <strong>Note:</strong> ₹10 cash-on-delivery handling charge has been added to your total.
                      </div>
                    )}

                    {formData.payment_method === 'ONLINE' && (
                      <div className="p-3 bg-light rounded border border-dashed text-center mb-3">
                        <p className="fw-bold small mb-2">Scan QR Code or Copy UPI ID to pay ₹{getFinalPrice()}</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=diyanasir01-2@oksbi%26am=${getFinalPrice()}`} alt="UPI QR Code" className="mb-2 rounded img-fluid" style={{ maxWidth: '160px' }} />
                        <div className="mb-2 d-flex justify-content-center align-items-center gap-2">
                          <code className="bg-white px-2 py-1 border rounded small">diyanasir01-2@oksbi</code>
                          <button type="button" onClick={copyUpiId} className="btn btn-outline-primary btn-sm py-1">Copy</button>
                        </div>
                        <input type="text" name="transaction_id" className="form-control form-control-lg fs-6" placeholder="Enter UTR / Transaction ID" value={formData.transaction_id} onChange={handleInputChange} />
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                      {loading ? 'Placing Order...' : `Confirm Order (₹${getFinalPrice()})`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRACKING SECTION */}
        {activeTab === 'track' && (
          <div className="card shadow-sm border-0 p-3 rounded-3">
            <div className="card-body p-1">
              <h5 className="fw-bold mb-3">Track Your Order Status</h5>
              <form onSubmit={handleTrackOrder} className="d-flex flex-column gap-2 mb-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg fs-6" 
                  placeholder="Enter Order ID (e.g. DNV-123456)" 
                  value={searchOrderId} 
                  onChange={(e) => setSearchOrderId(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary py-2 fw-bold fs-6">
                  Track Order
                </button>
              </form>

              {trackError && <div className="alert alert-danger p-2 small" role="alert">{trackError}</div>}

              {trackedOrder && (
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-primary m-0">Order ID: {trackedOrder.order_id}</h6>
                    <button 
                      className="btn btn-sm btn-outline-secondary py-0 px-2 fs-7"
                      onClick={handleTrackOrder}
                    >
                      🔄 Refresh Status
                    </button>
                  </div>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="p-2 bg-white rounded border">
                      <strong>Item:</strong> {trackedOrder.product_name || 'N/A'}
                    </div>
                    {trackedOrder.amount && (
                      <div className="p-2 bg-white rounded border">
                        <strong>Total Amount:</strong> ₹{trackedOrder.amount}
                      </div>
                    )}
                    <div className="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                      <strong>Status:</strong> 
                      <span className={`badge text-uppercase fs-6 ${
                        trackedOrder.order_status === 'Delivered' ? 'bg-success' :
                        trackedOrder.order_status === 'Cancelled' ? 'bg-danger' : 'bg-primary'
                      }`}>
                        {trackedOrder.order_status || 'Processing'}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>Payment Method:</strong> {trackedOrder.payment_method}
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>Address:</strong> {trackedOrder.address}, {trackedOrder.pincode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN SECTION */}
        {activeTab === 'admin' && isAdminAuthenticated && <Admin />}
      </div>

      {/* ADMIN PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="modal show d-block tab-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content rounded-3 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">🔐 Admin Access</h5>
                <button type="button" className="btn-close" onClick={handleClosePinModal}></button>
              </div>
              <form onSubmit={handlePinSubmit}>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-2">Please enter passcode to access dashboard:</p>
                  <input
                    type="password"
                    className="form-control form-control-lg text-center fs-4 fw-bold"
                    placeholder="Enter PIN"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    autoFocus
                    required
                  />
                  {pinError && <p className="text-danger small mt-2 mb-0 fw-semibold text-center">{pinError}</p>}
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={handleClosePinModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
