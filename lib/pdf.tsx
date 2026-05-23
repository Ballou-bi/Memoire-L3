'use server'

import QRCode from 'qrcode'

interface ExtraitComplet {
  id: string
  type: 'INTEGRALE' | 'AVEC_FILIATION' | 'SANS_FILIATION'
  createdAt: Date
  declaration: {
    nomEnfant: string
    prenomEnfant: string
    dateNaissance: Date
    lieuNaissance: string
    sexe: string
    nomPere: string
    prenomPere: string
    nomMere: string
    prenomMere: string
    acte: { numero: string; dateValidation: Date } | null
  }
  user: { nom: string; prenom: string }
}

export async function generatePDF(extrait: ExtraitComplet): Promise<Buffer> {
  const { renderToBuffer, Document, Page, Text, View, Image, StyleSheet } =
    await import('@react-pdf/renderer')

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verifier/${extrait.id}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })

  const styles = StyleSheet.create({
    page: {
      padding: 50,
      fontFamily: 'Helvetica',
      fontSize: 11,
      color: '#1a1a1a',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      borderBottomWidth: 2,
      borderBottomColor: '#c9a84c',
      paddingBottom: 20,
    },
    republic: {
      fontSize: 10,
      color: '#666',
      letterSpacing: 2,
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Helvetica-Bold',
      color: '#0a1628',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 10,
      color: '#888',
      letterSpacing: 1,
    },
    acteNum: {
      marginTop: 8,
      fontSize: 10,
      color: '#c9a84c',
      fontFamily: 'Helvetica-Bold',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: '#c9a84c',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: '#e8d5a3',
      paddingBottom: 4,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      width: 160,
      fontSize: 10,
      color: '#666',
    },
    value: {
      flex: 1,
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 50,
      right: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      borderTopWidth: 0.5,
      borderTopColor: '#ddd',
      paddingTop: 16,
    },
    footerLeft: {
      flex: 1,
    },
    footerText: {
      fontSize: 8,
      color: '#999',
      marginBottom: 2,
    },
    qr: {
      width: 80,
      height: 80,
    },
    watermark: {
      position: 'absolute',
      top: '45%',
      left: '15%',
      fontSize: 60,
      color: '#f0f0f0',
      fontFamily: 'Helvetica-Bold',
      transform: [{ rotate: '-35deg' }],
    },
    typeLabel: {
      backgroundColor: '#0a1628',
      color: '#c9a84c',
      paddingVertical: 4,
      paddingHorizontal: 12,
      fontSize: 9,
      letterSpacing: 1,
      alignSelf: 'center',
      marginTop: 6,
    },
  })

  const typeLabels = {
    INTEGRALE: 'COPIE INTÉGRALE',
    AVEC_FILIATION: 'EXTRAIT AVEC FILIATION',
    SANS_FILIATION: 'EXTRAIT SANS FILIATION',
  }

  const { declaration: d } = extrait

  const doc = (
    <Document
      title={`Extrait d'acte de naissance - ${d.prenomEnfant} ${d.nomEnfant}`}
      author="RegistreNatal"
    >
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>OFFICIEL</Text>

        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.republic}>RÉPUBLIQUE — ÉTAT CIVIL</Text>
          <Text style={styles.title}>Extrait d&apos;Acte de Naissance</Text>
          <Text style={styles.subtitle}>DOCUMENT OFFICIEL CERTIFIÉ</Text>
          {d.acte && (
            <Text style={styles.acteNum}>N° {d.acte.numero}</Text>
          )}
          <Text style={styles.typeLabel}>{typeLabels[extrait.type]}</Text>
        </View>

        {/* Informations de l'enfant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l&apos;enfant</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom :</Text>
            <Text style={styles.value}>{d.nomEnfant}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prénom :</Text>
            <Text style={styles.value}>{d.prenomEnfant}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date de naissance :</Text>
            <Text style={styles.value}>
              {new Date(d.dateNaissance).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lieu de naissance :</Text>
            <Text style={styles.value}>{d.lieuNaissance}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sexe :</Text>
            <Text style={styles.value}>{d.sexe === 'M' ? 'Masculin' : 'Féminin'}</Text>
          </View>
        </View>

        {/* Filiation (si applicable) */}
        {extrait.type !== 'SANS_FILIATION' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filiation</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Père :</Text>
              <Text style={styles.value}>
                {d.prenomPere} {d.nomPere}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mère :</Text>
              <Text style={styles.value}>
                {d.prenomMere} {d.nomMere}
              </Text>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              Document délivré le :{' '}
              {new Date(extrait.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            {d.acte && (
              <Text style={styles.footerText}>
                Acte validé le :{' '}
                {new Date(d.acte.dateValidation).toLocaleDateString('fr-FR')}
              </Text>
            )}
            <Text style={styles.footerText}>
              Demandé par : {extrait.user.prenom} {extrait.user.nom}
            </Text>
            <Text style={{ ...styles.footerText, marginTop: 6 }}>
              Vérifiez l&apos;authenticité de ce document en scannant le QR code →
            </Text>
          </View>
          <Image src={qrDataUrl} style={styles.qr} />
        </View>
      </Page>
    </Document>
  )

  return await renderToBuffer(doc)
}
