
pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')

        // ===== Variables para entorno autocreado =====
        // DESA
        DESA_PORT      = '3000'
        DESA_BASE      = '/opt/desa'
        DESA_RELEASES  = '/opt/desa/releases'
        DESA_CURRENT   = '/opt/desa/current'

        // PROD
        PROD_PORT      = '4000'
        PROD_BASE      = '/opt/produccion'
        PROD_RELEASES  = '/opt/produccion/releases'
        PROD_CURRENT   = '/opt/produccion/current'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/paula-sda/next-js-pokedex-25-26.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('jenkinsSonar') {
                    script {
                        sh """
                            npx sonar-scanner \
                                -Dsonar.projectKey=sonarPipeline \
                                -Dsonar.projectName='sonarPipeline' \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://172.174.241.22:9000 \
                                -Dsonar.token=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline abortado: Quality Gate = ${qg.status}"
                        }
                        echo "Quality Gate passed: ${qg.status}"
                    }
                }
            }
        }

        // =========================
        // DESA AUTOCREADO (DESA-<BUILD>) con nohup
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e

RELEASE_NAME="DESA-${BUILD_NUMBER}"
BUILD_DIR="${DESA_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# 1) Estructura / permisos
sudo mkdir -p "${DESA_RELEASES}"
sudo mkdir -p "${DESA_BASE}/logs"
sudo chown -R $USER:$USER "${DESA_BASE}"

# 2) Release por build
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo en la release
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Symlink "current" -> última release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

# 6) Parar anterior y arrancar nueva (puerto fijo DESA_PORT)
pkill -f "next start -H 0.0.0.0 -p ${DESA_PORT}" || true
sleep 1
cd "${DESA_CURRENT}"
nohup npm run start -- -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 &

# 7) Limpiar releases antiguas (dejar 5)
cd "${DESA_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

echo ">> DESA desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
echo "Esperando a que la aplicación de DESA se inicie..."
for i in {1..20}; do
    curl -s "http://172.174.241.22:${DESA_PORT}" > /dev/null && break
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

curl -f "http://172.174.241.22:${DESA_PORT}"
echo "DESA accesible: http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: '✅ DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        // =========================
        // PROD AUTOCREADO (PROD-<BUILD>) + PM2 + timeout
        // =========================
        stage('Deploy to PROD') {
            steps {
                sh '''
set -euo pipefail

RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# 1) Estructura / permisos
sudo mkdir -p "${PROD_RELEASES}"
sudo mkdir -p "${PROD_BASE}/logs"
sudo chown -R $USER:$USER "${PROD_BASE}"

# 2) Release por build
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Symlink "current"
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"

# 6) Arrancar con PM2 (daemon) en puerto fijo PROD_PORT
#    Aseguramos entorno igual que en tu VM (usuario jenkins)
export PM2_HOME="/var/lib/jenkins/.pm2"
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

cd "${PROD_CURRENT}"
pm2 delete pokedex-prod || true
pm2 start npm --name "pokedex-prod" --time --update-env -- run start -- -H 0.0.0.0 -p "${PROD_PORT}"
pm2 save

# 7) Limpiar releases antiguas (dejar 5)
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

# 8) Healthcheck con TIMEOUT (máx 60s) para verificar y NO colgar el stage
echo "Esperando a que la app de PRODUCCIÓN responda en el puerto ${PROD_PORT}..."
END=$((SECONDS+60))
OK=0
while [ $SECONDS -lt $END ]; do
  if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
    OK=1
    break
  fi
  echo "Aún no responde, reintento en 3s..."
  sleep 3
done

if [ "${OK}" -ne 1 ]; then
  echo "❌ La app PROD no responde tras 60s. Falla el stage para NO colgar el pipeline."
  echo "Diagnóstico corto de PM2 (no streaming):"
  pm2 logs pokedex-prod --lines 50 --nostream || true
  pm2 describe pokedex-prod || true
  exit 1
fi

echo ">> PROD desplegado OK: ${RELEASE_NAME} -> http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Test PROD (smoke)') {
            steps {
                sh '''
set -euo pipefail

echo "Test de humo en PRODUCCIÓN..."
# 1) Espera breve (máx 30s) y falla si no responde para NO colgarse
END=$((SECONDS+30))
OK=0
while [ $SECONDS -lt $END ]; do
  if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
    OK=1
    break
  fi
  echo "Aún no responde, reintento en 3s..."
  sleep 3
done

if [ "${OK}" -ne 1 ]; then
  echo "❌ Test de humo falló: no hay respuesta de PROD."
  exit 1
fi

# 2) Smoke real: código 200 en la home
curl -fsSL "http://172.174.241.22:${PROD_PORT}" > /dev/null

echo "✅ Test de humo OK: http://172.174.241.22:${PROD_PORT} responde."
'''
            }
        }
    }

    post {
        success {
            echo "DESPLIEGUE COMPLETADO (DESA autocreado + PRODUCCIÓN con PM2)"
        }
        failure {
            echo "El pipeline ha fallado. Revisa los logs."
        }
    }
}
