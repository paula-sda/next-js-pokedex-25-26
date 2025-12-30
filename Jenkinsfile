
pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')

        // ===== [NUEVO] Variables para entorno autocreado =====
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
        // DESA AUTOCREADO (cambios mínimos)
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e

# 1) Preparar estructura / permisos
sudo mkdir -p "${DESA_RELEASES}"
sudo mkdir -p "${DESA_BASE}/logs"
sudo chown -R $USER:$USER "${DESA_BASE}"

# 2) Crear carpeta de release por build
BUILD_DIR="${DESA_RELEASES}/${BUILD_NUMBER}"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo en la release
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar en la release
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Actualizar symlink "current" a la nueva release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

# 6) Parar instancia anterior y arrancar la nueva (puerto constante DESA_PORT)
pkill -f "next start -H 0.0.0.0 -p ${DESA_PORT}" || true
sleep 1
cd "${DESA_CURRENT}"
nohup npm run start -- -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 &

# 7) (Opcional) Mantener sólo las 5 últimas releases para ahorrar disco
cd "${DESA_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
echo "Esperando a que la aplicación de DESA se inicie..."
for i in {1..20}; do
    curl -s http://172.174.241.22:3000 > /dev/null && break
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

curl -f http://172.174.241.22:3000
echo "DESA accesible: http://172.174.241.22:3000"
'''
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: '✅ DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        // =========================
        // PROD AUTOCREADO (manteniendo PM2)
        // =========================
        stage('Deploy to PROD') {
            steps {
                sh '''
set -e

# 1) Preparar estructura / permisos
sudo mkdir -p "${PROD_RELEASES}"
sudo mkdir -p "${PROD_BASE}/logs"
sudo chown -R $USER:$USER "${PROD_BASE}"

# 2) Crear carpeta de release por build
BUILD_DIR="${PROD_RELEASES}/${BUILD_NUMBER}"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo en la release
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar en la release
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Actualizar symlink "current" a la nueva release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"

# 6) Arrancar con PM2 desde el symlink "current" (puerto constante PROD_PORT)
npm install -g pm2
pm2 delete pokedex-prod || true
cd "${PROD_CURRENT}"
pm2 start npm --name "pokedex-prod" -- run start -- -H 0.0.0.0 -p "${PROD_PORT}"
pm2 save
pm2 startup

# 7) (Opcional) Mantener sólo las 5 últimas releases para ahorrar disco
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true
'''
            }
        }

        stage('Test PROD (smoke)') {
            steps {
                sh '''
echo "Esperando a que la aplicación de PRODUCCIÓN se inicie..."
for i in {1..20}; do
    curl -s http://172.174.241.22:4000 > /dev/null && break
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

curl -f http://172.174.241.22:4000
echo "PRODUCCIÓN accesible: http://172.174.241.22:4000"
'''
            }
        }
    }

    post {
        success {
            echo "DESPLIEGUE COMPLETADO (DESA autocreado + PRODUCCIÓN autocreado con PM2)"
        }
        failure {
            echo "El pipeline ha fallado. Revisa los logs."
        }
    }
}
