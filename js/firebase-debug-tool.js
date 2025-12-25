/**
 * Firebase Debug Tool
 * YZOKUMUS kullanıcısı için Firebase'de veri olup olmadığını kontrol eder
 */

async function checkFirebaseData(username) {
    console.log('='.repeat(80));
    console.log('🔍 FIREBASE VERİ KONTROL ARACI');
    console.log('='.repeat(80));
    console.log('Kullanıcı adı:', username);
    
    // 1. Username to DocId conversion check
    const docId = typeof window.usernameToDocId === 'function' 
        ? window.usernameToDocId(username) 
        : username.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    console.log('Firebase Document ID:', docId);
    
    // 2. Firebase availability check
    console.log('\n📦 FIREBASE DURUM KONTROLÜ:');
    console.log('  - FIREBASE_ENABLED:', window.FIREBASE_ENABLED);
    console.log('  - firebaseAuth exists:', !!window.firebaseAuth);
    console.log('  - firestore exists:', !!window.firestore);
    console.log('  - Current Firebase user:', window.firebaseAuth?.currentUser?.uid || 'YOK');
    
    // 3. LocalStorage check
    console.log('\n💾 LOCALSTORAGE KONTROLÜ:');
    console.log('  - hasene_username:', localStorage.getItem('hasene_username'));
    console.log('  - hasene_totalPoints:', localStorage.getItem('hasene_totalPoints'));
    console.log('  - hasene_user_id:', localStorage.getItem('hasene_user_id'));
    console.log('  - hasene_firebase_user_id:', localStorage.getItem('hasene_firebase_user_id'));
    console.log('  - hasene_user_type:', localStorage.getItem('hasene_user_type'));
    
    // 4. Firebase'den veri okuma denemesi
    if (window.FIREBASE_ENABLED && window.firestore) {
        console.log('\n☁️ FIREBASE\'DEN VERİ OKUMA:');
        
        try {
            // Try reading user_stats
            const userStatsRef = window.firestore.collection('user_stats').doc(docId);
            const userStatsDoc = await userStatsRef.get();
            
            console.log('  - user_stats doc exists:', userStatsDoc.exists);
            
            if (userStatsDoc.exists) {
                const data = userStatsDoc.data();
                console.log('  - user_stats data:');
                console.log('    • total_points:', data.total_points);
                console.log('    • user_id:', data.user_id);
                console.log('    • streak_data:', JSON.stringify(data.streak_data || {}));
                console.log('    • game_stats:', JSON.stringify(data.game_stats || {}));
                console.log('    • Tüm veri:', JSON.stringify(data, null, 2));
            } else {
                console.log('  ❌ Firebase\'de user_stats bulunamadı!');
                console.log('  ℹ️ Bu kullanıcı için hiç veri kaydedilmemiş olabilir.');
            }
            
            // Try reading daily_tasks
            const dailyTasksRef = window.firestore.collection('daily_tasks').doc(docId);
            const dailyTasksDoc = await dailyTasksRef.get();
            
            console.log('\n  - daily_tasks doc exists:', dailyTasksDoc.exists);
            if (dailyTasksDoc.exists) {
                console.log('  - daily_tasks data:', JSON.stringify(dailyTasksDoc.data(), null, 2));
            }
            
            // Try listing all user_stats documents (admin check)
            console.log('\n📋 TÜM KULLANICILAR (ilk 5):');
            try {
                const allUsersSnapshot = await window.firestore.collection('user_stats').limit(5).get();
                console.log('  - Toplam user_stats docs:', allUsersSnapshot.size);
                allUsersSnapshot.forEach(doc => {
                    console.log('    • Doc ID:', doc.id, '| Points:', doc.data().total_points);
                });
            } catch (listError) {
                console.warn('  ⚠️ Tüm kullanıcıları listelerken hata:', listError.message);
            }
            
        } catch (error) {
            console.error('  ❌ Firebase okuma hatası:', error);
            console.error('  - Error code:', error.code);
            console.error('  - Error message:', error.message);
            
            if (error.code === 'permission-denied') {
                console.warn('  ⚠️ Permission denied! Firebase auth gerekli olabilir.');
                console.warn('  ℹ️ Lütfen önce Firebase\'e giriş yapın (anonymous auth).');
            }
        }
    } else {
        console.warn('\n⚠️ Firebase kullanılamıyor!');
    }
    
    // 5. Auth status
    if (window.firebaseAuth) {
        console.log('\n🔐 FIREBASE AUTH DURUMU:');
        const currentUser = window.firebaseAuth.currentUser;
        if (currentUser) {
            console.log('  ✅ Firebase kullanıcısı giriş yapmış');
            console.log('  - UID:', currentUser.uid);
            console.log('  - Email:', currentUser.email || 'YOK (anonymous)');
            console.log('  - Display name:', currentUser.displayName || 'YOK');
            console.log('  - Is anonymous:', currentUser.isAnonymous);
        } else {
            console.log('  ❌ Firebase kullanıcısı giriş yapmamış');
            console.log('  ℹ️ Anonymous auth deneyin: window.autoSignInAnonymous()');
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Kontrol tamamlandı!');
    console.log('='.repeat(80));
}

// Console'dan çağrılabilir hale getir
if (typeof window !== 'undefined') {
    window.checkFirebaseData = checkFirebaseData;
    window.debugFirebase = (username = 'YZOKUMUS') => checkFirebaseData(username);
}

console.log('🛠️ Firebase Debug Tool yüklendi!');
console.log('📌 Kullanım: window.debugFirebase("YZOKUMUS")');

