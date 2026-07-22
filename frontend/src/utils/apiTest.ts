/**
 * API TEST SUITE — Test strict de tous les endpoints admin
 * Pout & Scent
 * 
 * Usage: Appeler testAllApis() depuis la console du navigateur 
 * après connexion en tant qu'admin
 */
import { apiClient } from '@/api/client';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function testApi(
  name: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  expectedStatus?: number[]
): Promise<TestResult> {
  const start = performance.now();
  const result: TestResult = {
    endpoint: url,
    method,
    status: 'FAIL',
    duration: 0,
  };

  try {
    let response;
    switch (method) {
      case 'GET':
        response = await apiClient.get(url);
        break;
      case 'POST':
        response = await apiClient.post(url, data);
        break;
      case 'PUT':
        response = await apiClient.put(url, data);
        break;
      case 'PATCH':
        response = await apiClient.patch(url, data);
        break;
      case 'DELETE':
        response = await apiClient.delete(url);
        break;
    }

    result.statusCode = response?.status;
    result.status = 'PASS';
    
    if (expectedStatus && !expectedStatus.includes(response?.status || 0)) {
      result.status = 'FAIL';
      result.error = `Expected status ${expectedStatus.join('|')}, got ${response?.status}`;
    }
  } catch (error: any) {
    result.statusCode = error.response?.status;
    result.error = error.response?.data?.error || error.message || 'Unknown error';
    
    // 403/401 are expected for permission tests
    if (expectedStatus && expectedStatus.includes(error.response?.status)) {
      result.status = 'PASS';
    }
  }

  result.duration = Math.round(performance.now() - start);
  results.push(result);
  
  const icon = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`${icon} [${result.method}] ${name} → ${result.statusCode} (${result.duration}ms)${result.error ? ' - ' + result.error : ''}`);
  
  return result;
}

export async function testAllApis() {
  console.log('🧪 ═══════════════════════════════════════');
  console.log('🧪 TEST API — Pout & Scent Admin');
  console.log('🧪 ═══════════════════════════════════════\n');

  results.length = 0;

  // ═══ AUTH ═══
  console.log('\n📋 AUTH');
  await testApi('Profil utilisateur', 'GET', '/auth/me/', undefined, [200]);

  // ═══ CATALOG — Catégories ═══
  console.log('\n📋 CATALOG — Catégories');
  await testApi('Liste catégories', 'GET', '/v1/catalog/categories/', undefined, [200]);
  
  // Test création catégorie
  const catResult = await testApi('Créer catégorie', 'POST', '/v1/catalog/categories/', {
    nom: 'Test API Catégorie',
    type: 'PARFUM',
    slug: 'test-api-categorie-' + Date.now(),
    description: 'Catégorie de test API',
  }, [201]);

  // Si création réussie, tester update et delete
  if (catResult.status === 'PASS' && catResult.statusCode === 201) {
    // Récupérer l'ID de la catégorie créée
    const catList = await apiClient.get('/v1/catalog/categories/');
    const testCat = catList.data.results?.find((c: any) => c.nom === 'Test API Catégorie');
    
    if (testCat) {
      await testApi('Modifier catégorie', 'PATCH', `/v1/catalog/categories/${testCat.id}/`, {
        nom: 'Test API Catégorie Modifiée',
      }, [200]);
      
      await testApi('Supprimer catégorie', 'DELETE', `/v1/catalog/categories/${testCat.id}/`, undefined, [200, 204]);
    }
  }

  // ═══ CATALOG — Produits ═══
  console.log('\n📋 CATALOG — Produits');
  await testApi('Liste produits', 'GET', '/v1/catalog/products/', undefined, [200]);
  
  // Récupérer une catégorie valide pour le test
  let validCategorieId = '';
  try {
    const cats = await apiClient.get('/v1/catalog/categories/');
    if (cats.data.results?.length > 0) {
      validCategorieId = cats.data.results[0].id;
    }
  } catch (e) {}

  if (validCategorieId) {
    // Test création produit
    const prodResult = await testApi('Créer produit', 'POST', '/v1/catalog/products/', {
      nom: 'Test API Produit',
      marque: 'TestBrand',
      description: 'Produit de test API',
      categorie_id: validCategorieId,
      is_featured: false,
    }, [201]);

    if (prodResult.status === 'PASS') {
      const prodList = await apiClient.get('/v1/catalog/products/', { params: { search: 'Test API Produit' } });
      const testProd = prodList.data.results?.find((p: any) => p.nom === 'Test API Produit');
      
      if (testProd) {
        await testApi('Détail produit', 'GET', `/v1/catalog/products/${testProd.id}/`, undefined, [200]);
        
        await testApi('Modifier produit', 'PATCH', `/v1/catalog/products/${testProd.id}/`, {
          nom: 'Test API Produit Modifié',
          categorie_id: validCategorieId,
        }, [200]);
        
        await testApi('Supprimer produit', 'DELETE', `/v1/catalog/products/${testProd.id}/`, undefined, [200, 204]);
      }
    }
  } else {
    console.log('⏭️ SKIP: Pas de catégorie disponible pour tester la création de produit');
  }

  // ═══ ORDERS ═══
  console.log('\n📋 ORDERS');
  await testApi('Liste commandes', 'GET', '/v1/orders/', undefined, [200]);

  // ═══ PROMOTIONS ═══
  console.log('\n📋 PROMOTIONS');
  await testApi('Liste promotions', 'GET', '/v1/promotions/', undefined, [200]);

  // ═══ REVIEWS ═══
  console.log('\n📋 REVIEWS');
  await testApi('Liste avis', 'GET', '/v1/reviews/', undefined, [200]);

  // ═══ CHAT ═══
  console.log('\n📋 CHAT');
  await testApi('Liste conversations', 'GET', '/v1/chat/conversations/', undefined, [200, 403]);

  // ═══ USERS ═══
  console.log('\n📋 USERS');
  await testApi('Liste adresses', 'GET', '/v1/users/addresses/', undefined, [200]);

  // ═══ RÉSUMÉ ═══
  console.log('\n🧪 ═══════════════════════════════════════');
  console.log('🧪 RÉSUMÉ DES TESTS');
  console.log('🧪 ═══════════════════════════════════════');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`✅ Passés: ${passed}/${total}`);
  console.log(`❌ Échoués: ${failed}/${total}`);
  
  if (failed > 0) {
    console.log('\n❌ Tests échoués:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ${r.method} ${r.endpoint} → ${r.statusCode} - ${r.error}`);
    });
  }

  console.log('\n🧪 Temps total:', Math.round(results.reduce((s, r) => s + r.duration, 0)) + 'ms');
  
  return results;
}

// Exposer globalement pour la console
if (typeof window !== 'undefined') {
  (window as any).testApis = testAllApis;
}
